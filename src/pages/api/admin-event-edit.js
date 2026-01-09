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

    const payload = {
      title: form.get("title"),
      date,
      end_date,
      location: form.get("location"),
      link: form.get("link"),
      image_url: form.get("image_url"),
      live: form.get("live") || null,
    };

    const { error } = await supabaseAdmin
      .from("event_data")
      .update(payload)
      .eq("id", Number(id));

    if (error) {
      return new Response(JSON.stringify(error, null, 2), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
