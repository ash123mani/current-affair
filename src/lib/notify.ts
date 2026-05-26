import { notifications } from "@mantine/notifications";

export function notifySuccess(title: string, message?: string) {
  notifications.show({
    title,
    message: message ?? "",
    color: "teal",
    autoClose: 3000,
  });
}

export function notifyError(title: string, message?: string) {
  notifications.show({
    title,
    message: message ?? "",
    color: "red",
    autoClose: 5000,
  });
}
