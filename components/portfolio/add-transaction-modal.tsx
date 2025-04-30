"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CoinData, PortfolioHolding, Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransaction: (transaction: Transaction) => void
  coins: CoinData[]
  holdings: PortfolioHolding[]
}

const formSchema = z.object({
  coinId: z.string({
    required_error: "Please select a cryptocurrency",
  }),
  type: z.enum(["buy", "sell"], {
    required_error: "Please select a transaction type",
  }),
  amount: z.coerce
    .number({
      required_error: "Please enter an amount",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive"),
  price: z.coerce
    .number({
      required_error: "Please enter a price",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be positive"),
  date: z.date({
    required_error: "Please select a date",
  }),
})

export function AddTransactionModal({ isOpen, onClose, onAddTransaction, coins, holdings }: AddTransactionModalProps) {
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "buy",
      amount: undefined,
      price: undefined,
      date: new Date(),
    },
  })

  const transactionType = form.watch("type")
  const selectedCoin = selectedCoinId ? coins.find((coin) => coin.id === selectedCoinId) : null

  function onSubmit(values: z.infer<typeof formSchema>) {
    const transaction: Transaction = {
      id: Date.now().toString(),
      coinId: values.coinId,
      type: values.type,
      amount: values.amount,
      price: values.price,
      date: values.date.toISOString(),
    }

    onAddTransaction(transaction)
    form.reset()
    onClose()
  }

  const handleCoinChange = (coinId: string) => {
    setSelectedCoinId(coinId)

    // If a coin is selected and it exists in our data, pre-fill the current price
    const selectedCoin = coins.find((coin) => coin.id === coinId)
    if (selectedCoin) {
      form.setValue("price", selectedCoin.current_price)
    }
  }

  // Get available coins for selling (only those in portfolio)
  const availableCoinsForSell = holdings.map((holding) => {
    const coin = coins.find((c) => c.id === holding.coinId)
    return {
      id: holding.coinId,
      name: coin?.name || holding.coinId,
      symbol: coin?.symbol || "",
      amount: holding.amount,
    }
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a buy or sell transaction for your portfolio.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coinId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cryptocurrency</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleCoinChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cryptocurrency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {transactionType === "buy"
                        ? // Show all coins for buying
                          coins.map((coin) => (
                            <SelectItem key={coin.id} value={coin.id}>
                              <div className="flex items-center">
                                <img
                                  src={coin.image || "/placeholder.svg"}
                                  alt={coin.name}
                                  className="mr-2 h-5 w-5 rounded-full"
                                />
                                {coin.name} ({coin.symbol.toUpperCase()})
                              </div>
                            </SelectItem>
                          ))
                        : // Show only owned coins for selling
                          availableCoinsForSell.map((coin) => (
                            <SelectItem key={coin.id} value={coin.id}>
                              <div className="flex items-center">
                                <img
                                  src={coins.find((c) => c.id === coin.id)?.image || "/placeholder.svg"}
                                  alt={coin.name}
                                  className="mr-2 h-5 w-5 rounded-full"
                                />
                                {coin.name} ({coin.symbol.toUpperCase()}) -{" "}
                                {coin.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                              </div>
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...field}
                      // Fix: Handle empty input case properly
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                        field.onChange(value)
                      }}
                      // Ensure value is never undefined in the DOM
                      value={field.value === undefined ? "" : field.value}
                    />
                  </FormControl>
                  {selectedCoinId && transactionType === "sell" && (
                    <FormDescription>
                      Available:{" "}
                      {holdings
                        .find((h) => h.coinId === selectedCoinId)
                        ?.amount.toLocaleString(undefined, { maximumFractionDigits: 8 }) || 0}{" "}
                      {selectedCoin?.symbol.toUpperCase()}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per coin (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      {...field}
                      // Fix: Handle empty input case properly
                      onChange={(e) => {
                        const value = e.target.value === "" ? undefined : Number.parseFloat(e.target.value)
                        field.onChange(value)
                      }}
                      // Ensure value is never undefined in the DOM
                      value={field.value === undefined ? "" : field.value}
                    />
                  </FormControl>
                  {selectedCoin && (
                    <FormDescription>
                      Current price: $
                      {selectedCoin.current_price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Add Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
