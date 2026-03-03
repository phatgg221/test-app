import { message } from "antd";

type ToastVariant = "default" | "destructive";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

function toast({ title, description, variant, duration = 3 }: ToastOptions) {
  const content = [title, description].filter(Boolean).join(": ");

  switch (variant) {
    case "destructive":
      message.error(content, duration);
      break;
    default:
      message.success(content, duration);
      break;
  }
}

function useToast() {
  return { toast };
}

export { useToast, toast };
