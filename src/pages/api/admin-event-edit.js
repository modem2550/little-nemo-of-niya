import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const id = form.get("id");
    const date = form.get("date") || null;
    const end_date = form.get("end_date") || null;

    if (date && end_date && end_date < date) {
      return new Response("end_date ห้ามน้อยกว่า date", { status: 400 });
    }

    // Get image_urls from form (if uploaded new images)
    const imageUrlsString = form.get("image_urls");
    const newImageUrls = imageUrlsString ? JSON.parse(imageUrlsString) : null;

    // ===== ลบรูปเก่าถ้ามีการอัปโหลดรูปใหม่ =====
    if (newImageUrls) {
      // Fetch current event data to get old image_urls
      const { data: currentEvent, error: fetchError } = await supabaseAdmin
        .from("event_data")
        .select("image_urls")
        .eq("id", Number(id))
        .single();

      if (!fetchError && currentEvent?.image_urls) {
        // Extract eventId from old URLs to delete files
        const oldUrls = currentEvent.image_urls;
        
        // Get first URL to extract eventId (pattern: .../events/{eventId}/...)
        const firstUrl = oldUrls.thumbnail || oldUrls.small || oldUrls.medium || oldUrls.large;
        
        if (firstUrl) {
          const match = firstUrl.match(/events\/([^/]+)\//);
          const oldEventId = match ? match[1] : null;

          if (oldEventId) {
            // Delete all 4 sizes
            const sizes = ['thumbnail', 'small', 'medium', 'large'];
            
            for (const size of sizes) {
              const filePath = `events/${oldEventId}/${size}.webp`;
              
              const { error: deleteError } = await supabaseAdmin.storage
                .from('event-images')
                .remove([filePath]);

              if (deleteError) {
                console.error(`Failed to delete ${filePath}:`, deleteError);
                // Continue deleting other files even if one fails
              }
            }
          }
        }
      }
    }

    // ===== Prepare payload =====
    const payload = {
      title: form.get("title"),
      date,
      end_date,
      location: form.get("location"),
      link: form.get("link"),
      live: form.get("live") || null,
    };

    // If new images uploaded, update image_urls and set image_url to null
    if (newImageUrls) {
      payload.image_urls = newImageUrls;
      payload.image_url = null;
    }

    // ===== Update database =====
    const { error } = await supabaseAdmin
      .from("event_data")
      .update(payload)
      .eq("id", Number(id));

    if (error) {
      return new Response(JSON.stringify(error, null, 2), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Edit API error:", err);
    return new Response(err.message, { status: 500 });
  }
}