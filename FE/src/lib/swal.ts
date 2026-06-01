import Swal from "sweetalert2"

const NEO_POPUP = "swal-neo"

export async function showConfirm(title: string, text?: string): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "YES",
    cancelButtonText: "CANCEL",
    reverseButtons: true,
    customClass: {
      popup: NEO_POPUP,
      confirmButton: "swal2-confirm--green",
      cancelButton: "swal2-cancel--black",
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
      popup: NEO_POPUP,
    },
  })
}
