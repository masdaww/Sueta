import { useState, useCallback } from 'react'
import { Modal } from './Modal'
import { confirmRegistry, type ConfirmOptions } from './confirm'

export function ConfirmHost() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  confirmRegistry.setOptions = setOptions

  const close = useCallback((v: boolean) => {
    confirmRegistry.resolve?.(v)
    confirmRegistry.resolve = null
    setOptions(null)
  }, [])

  return (
    <Modal
      open={!!options}
      onClose={() => close(false)}
      title={options?.title ?? ''}
      size="sm"
      footer={
        <>
          <button className="btn-secondary" onClick={() => close(false)}>
            {options?.cancelText ?? 'Отмена'}
          </button>
          <button
            className={options?.danger ? 'btn-danger' : 'btn-primary'}
            onClick={() => close(true)}
            autoFocus
          >
            {options?.confirmText ?? 'OK'}
          </button>
        </>
      }
    >
      <p className="text-slate-600">{options?.message}</p>
    </Modal>
  )
}
