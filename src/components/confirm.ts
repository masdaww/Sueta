export type ConfirmOptions = {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export const confirmRegistry: {
  resolve: ((v: boolean) => void) | null
  setOptions: ((o: ConfirmOptions | null) => void) | null
} = {
  resolve: null,
  setOptions: null,
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    confirmRegistry.resolve = resolve
    confirmRegistry.setOptions?.(options)
  })
}
