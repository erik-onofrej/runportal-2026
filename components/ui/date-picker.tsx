"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  value?: Date | null
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  showTime?: boolean
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  showTime = false,
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState<string>("")

  // Initialize time value when date changes
  React.useEffect(() => {
    if (value && showTime) {
      const hours = value.getHours().toString().padStart(2, "0")
      const minutes = value.getMinutes().toString().padStart(2, "0")
      setTimeValue(`${hours}:${minutes}`)
    }
  }, [value, showTime])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined)
      if (!showTime) {
        setOpen(false)
      }
      return
    }

    let finalDate = selectedDate

    // If time selection is enabled and we have a time value, apply it
    if (showTime && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number)
      finalDate = new Date(selectedDate)
      finalDate.setHours(hours || 0)
      finalDate.setMinutes(minutes || 0)
    }

    onChange?.(finalDate)

    // Only close popover if not showing time (so user can select time)
    if (!showTime) {
      setOpen(false)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeValue = e.target.value
    setTimeValue(newTimeValue)

    if (value && newTimeValue) {
      const [hours, minutes] = newTimeValue.split(":").map(Number)
      const newDate = new Date(value)
      newDate.setHours(hours || 0)
      newDate.setMinutes(minutes || 0)
      onChange?.(newDate)
    }
  }

  const formatDate = (date: Date) => {
    if (showTime) {
      return format(date, "PPP HH:mm")
    }
    return format(date, "PPP")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={handleDateSelect}
          initialFocus
        />
        {showTime && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <label htmlFor="time-picker" className="text-sm font-medium">
                Time:
              </label>
              <Input
                id="time-picker"
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-auto"
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
