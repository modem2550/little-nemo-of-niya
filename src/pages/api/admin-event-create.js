import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  try {
    const form = await request.formData();

    const payload = {
      title: form.get("title"),
      date: form.get("date"),
      end_date: form.get("end_date") || null,
      location: form.get("location"),
      link: form.get("link"),
      image_url: form.get("image_url"),
      live: form.get("live") || null,
    };

    const { error } = await supabaseAdmin
      .from("event_data")
      .insert(payload);

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
