import { toast } from "sonner";
import { exportAuditReportAction } from "@/actions/audits";

export async function downloadAuditExcel(
  auditId: string,
  websiteUrl?: string
): Promise<boolean> {
  if (!auditId) {
    toast.error("Audit ID is missing.");
    return false;
  }

  const toastId = toast.loading("Preparing Excel report...");

  try {
    // 1. Primary: Server Action
    const result = await exportAuditReportAction(auditId);
    if (result.error) {
      throw new Error(result.error);
    }

    if (result.success && result.base64) {
      const byteCharacters = atob(result.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        result.filename ||
        `CRO-Growth-Audit-${websiteUrl || "Report"}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Excel report downloaded successfully!", { id: toastId });
      return true;
    }

    // 2. Secondary Fallback: Direct API route fetch
    const response = await fetch(`/api/audit/${auditId}/export`);
    if (!response.ok) {
      let errText = "Failed to export report";
      try {
        const json = await response.json();
        if (json?.error) errText = json.error;
      } catch {}
      throw new Error(errText);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanName = (websiteUrl || "Website").replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    );
    link.download = `CRO-Growth-Audit-${cleanName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    toast.success("Excel report downloaded successfully!", { id: toastId });
    return true;
  } catch (err: any) {
    console.error("Export error:", err);
    toast.error(err?.message || "Failed to download Excel report.", {
      id: toastId,
    });
    return false;
  }
}
