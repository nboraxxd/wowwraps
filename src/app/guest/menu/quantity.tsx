import { Minus, Plus } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}

export default function Quantity({ value, disabled, onChange }: Props) {
  function handleChangeQuantity(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return

    const value = Number(e.target.value)
    if (isNaN(value)) return

    onChange(value)
  }

  return (
    <div className="flex gap-1 ">
      <Button className="size-6 p-0" disabled={value === 0 || disabled} onClick={() => onChange(value - 1)}>
        <Minus className="size-3" />
      </Button>
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="h-6 w-8 p-1 text-center"
        value={value}
        onChange={handleChangeQuantity}
        disabled={disabled}
      />
      <Button className="size-6 p-0" disabled={disabled} onClick={() => onChange(value + 1)}>
        <Plus className="size-3" />
      </Button>
    </div>
  )
}
