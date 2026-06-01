import Swal from "sweetalert2"

export async function showConfirm(title: string, text?: string): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "YES",
    cancelButtonText: "CANCEL",
    confirmButtonColor: "#16A34A",
    cancelButtonColor: "#000",
    reverseButtons: true,
    customClass: {
      popup: "border-4 border-black rounded-none font-mono bg-white",
      title: "text-sm font-bold uppercase mb-4",
      htmlContainer: "text-xs mb-4",
      confirmButton: "border-4 border-black font-mono text-xs font-bold uppercase px-6 py-2 bg-green-600 text-white hover:bg-green-700",
      cancelButton: "border-4 border-black font-mono text-xs font-bold uppercase px-6 py-2 bg-black text-white hover:bg-gray-800",
    },
  })
  return result.isConfirmed
}

export function showToast(type: "success" | "error" | "info", message: string) {
  Swal.fire({
    icon: type,
    title: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "border-4 border-black rounded-none font-mono bg-white mt-12 w-64 shadow-lg",
      title: "text-xs font-bold uppercase",
    },
  })
}