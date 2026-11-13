
import { withSupabase } from "npm:@supabase/server@1.9.2";

const BUCKET = "visitor-photos-private";
const MAX_BODY = 100 * 1024;
const MAX_PHOTO = 60 * 1024;
const MAX_DIMENSION = 256;

function json(
  data: Record<string, unknown>,
  status = 200,
): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

// Read requests with a strict size limit.
async function readLimited(
  req: Request,
): Promise<Uint8Array> {
  if (!req.body) throw new Error("EMPTY_BODY");

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      total += value.byteLength;

      if (total > MAX_BODY) {
        await reader.cancel();
        throw new Error("TOO_LARGE");
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Check WebP container and image dimensions.
function validWebP(bytes: Uint8Array): boolean {
  if (bytes.length < 30) return false;

  const view = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  );

  const ascii = (start: number, count: number) =>
    String.fromCharCode(
      ...bytes.subarray(start, start + count),
    );

  if (
    ascii(0, 4) !== "RIFF" ||
    ascii(8, 4) !== "WEBP" ||
    view.getUint32(4, true) !== bytes.length - 8
  ) return false;

  const format = ascii(12, 4);
  const chunkSize = view.getUint32(16, true);

  if (20 + chunkSize > bytes.length) return false;

  let width = 0;
  let height = 0;

  if (format === "VP8X" && chunkSize >= 10) {
    // Reject animation and metadata flags.
    if ((bytes[20] & 0x0e) !== 0) return false;

    width =
      1 + bytes[24] +
      (bytes[25] << 8) +
      (bytes[26] << 16);

    height =
      1 + bytes[27] +
      (bytes[28] << 8) +
      (bytes[29] << 16);
  } else if (
    format === "VP8L" &&
    chunkSize >= 5 &&
    bytes[20] === 0x2f
  ) {
    width =
      1 + bytes[21] +
      ((bytes[22] & 0x3f) << 8);

    height =
      1 +
      ((bytes[22] & 0xc0) >> 6) +
      (bytes[23] << 2) +
      ((bytes[24] & 0x0f) << 10);
  } else if (
    format === "VP8 " &&
    chunkSize >= 10 &&
    bytes[23] === 0x9d &&
    bytes[24] === 0x01 &&
    bytes[25] === 0x2a
  ) {
    width = view.getUint16(26, true) & 0x3fff;
    height = view.getUint16(28, true) & 0x3fff;
  } else {
    return false;
  }

  return (
    width > 0 &&
    height > 0 &&
    width <= MAX_DIMENSION &&
    height <= MAX_DIMENSION
  );
}

async function verifyCaptcha(
  token: string,
  secret: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret,
          response: token,
        }),
        signal: AbortSignal.timeout(6000),
      },
    );

    if (!response.ok) return false;

    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

export default {
  fetch: withSupabase(
    { auth: "user", cors: { headers: {
      "Access-Control-Allow-Origin": "https://shehroz-codes.github.io",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    } } },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }

      // Deployment safety switch.
      // Submissions stay disabled until testing is complete.
      if (
        Deno.env.get("VISITOR_SUBMISSIONS_ENABLED") !==
        "true"
      ) {
        return json(
          { error: "Submissions not enabled yet" },
          503,
        );
      }

      const captchaSecret =
        Deno.env.get("TURNSTILE_SECRET_KEY");

      if (!captchaSecret) {
        return json(
          { error: "Security configuration incomplete" },
          503,
        );
      }

      const userId = ctx.userClaims?.sub;

      if (
        typeof userId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(userId)
      ) {
        return json({ error: "Invalid user" }, 401);
      }

      const contentType =
        req.headers.get("content-type") ?? "";

      if (
        !/^multipart\/form-data\s*;/i.test(contentType)
      ) {
        return json(
          { error: "Multipart form required" },
          415,
        );
      }

      const length = Number(
        req.headers.get("content-length") ?? "0",
      );

      if (
        !Number.isFinite(length) ||
        length < 0 ||
        length > MAX_BODY
      ) {
        return json({ error: "Request too large" }, 413);
      }

      let uploadedPath: string | null = null;
      let committed = false;

      try {
        const bytes = await readLimited(req);

        const form = await new Request(
          "https://local.invalid/",
          {
            method: "POST",
            headers: { "content-type": contentType },
            body: bytes,
          },
        ).formData();

        const allowed = new Set([
          "name",
          "text",
          "photo",
          "turnstile_token",
        ]);

        for (const key of form.keys()) {
          if (
            !allowed.has(key) ||
            form.getAll(key).length !== 1
          ) {
            return json({ error: "Invalid fields" }, 400);
          }
        }

        const rawName = form.get("name");
        const rawText = form.get("text");
        const rawPhoto = form.get("photo");
        const captcha = form.get("turnstile_token");

        if (
          typeof rawName !== "string" ||
          typeof rawText !== "string" ||
          typeof captcha !== "string"
        ) {
          return json({ error: "Missing fields" }, 400);
        }

        const name = rawName.trim().normalize("NFC");
        const text = rawText.trim().normalize("NFC");

        if (
          name.length < 1 ||
          name.length > 80 ||
          text.length < 1 ||
          text.length > 300 ||
          /[\u0000-\u001f\u007f]/u.test(name) ||
          /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)
        ) {
          return json(
            { error: "Invalid name or message" },
            400,
          );
        }

        let photoBytes: Uint8Array | null = null;

        if (rawPhoto !== null) {
          if (
            !(rawPhoto instanceof File) ||
            rawPhoto.type !== "image/webp" ||
            rawPhoto.size < 30 ||
            rawPhoto.size > MAX_PHOTO
          ) {
            return json(
              { error: "Invalid photo" },
              400,
            );
          }

          photoBytes = new Uint8Array(
            await rawPhoto.arrayBuffer(),
          );

          if (!validWebP(photoBytes)) {
            return json(
              { error: "Invalid WebP dimensions" },
              400,
            );
          }
        }

        if (
          captcha.length < 1 ||
          captcha.length > 4096 ||
          !(await verifyCaptcha(captcha, captchaSecret))
        ) {
          return json(
            { error: "Security check failed" },
            403,
          );
        }

        if (photoBytes) {
          uploadedPath =
            `${userId}/${crypto.randomUUID()}.webp`;

          const { error } =
            await ctx.supabaseAdmin.storage
              .from(BUCKET)
              .upload(uploadedPath, photoBytes, {
                contentType: "image/webp",
                upsert: false,
                cacheControl: "3600",
              });

          if (error) {
            console.error("Storage upload failed");
            return json(
              { error: "Photo upload failed" },
              500,
            );
          }
        }

        // Atomic cooldown + message publishing.
        const { data: messageId, error: rpcError } =
          await ctx.supabaseAdmin.rpc(
            "publish_visitor_message",
            {
              p_user_id: userId,
              p_name: name,
              p_text: text,
              p_photo_path: uploadedPath,
            },
          );

        if (rpcError) {
          if (rpcError.message.includes("COOLDOWN")) {
            return json(
              {
                error: "Please wait 10 minutes",
                code: "COOLDOWN",
              },
              429,
            );
          }

          console.error(
            "Publishing failed",
            rpcError.code,
          );

          return json(
            { error: "Unable to publish message" },
            500,
          );
        }

        committed = true;

        return json(
          {
            success: true,
            message_id: messageId,
          },
          201,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "TOO_LARGE"
        ) {
          return json({ error: "Request too large" }, 413);
        }

        console.error("Submission failed");

        return json(
          { error: "Unable to process submission" },
          400,
        );
      } finally {
        // Best-effort cleanup if publishing failed.
        if (uploadedPath && !committed) {
          const { error } =
            await ctx.supabaseAdmin.storage
              .from(BUCKET)
              .remove([uploadedPath]);

          if (error) {
            console.error("Photo cleanup failed");
          }
        }
      }
    },
  ),
};

