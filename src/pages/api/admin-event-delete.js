import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const id = form.get("id");

    const { error } = await supabaseAdmin
      .from("event_data")
      .delete()
      .eq("id", Number(id));

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
