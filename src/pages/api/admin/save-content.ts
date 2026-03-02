import { getSupabase } from "../../../lib/supabase.server";

export async function POST({ request }: { request: Request }) {
    try {
        const formData = await request.formData();
        const supabase = getSupabase();
        
        // แปลง FormData เป็น object
        const data: any = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // เพิ่มข้อมูล metadata
        data.page_name = "index";
        data.updated_at = new Date().toISOString();
        
        // บันทึกลงฐานข้อมูล
        const { error } = await supabase
            .from("page_content")
            .upsert(data, { onConflict: "page_name" });
        
        if (error) throw error;
        
        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "บันทึกข้อมูลสำเร็จ" 
            }),
            { 
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Admin save error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(
            JSON.stringify({ 
                success: false, 
                message: "เกิดข้อผิดพลาด: " + errorMessage
            }),
            { 
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
}