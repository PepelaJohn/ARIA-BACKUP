import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function SelectOptions() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Choose Payment Method" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Payment Methods</SelectLabel>
          <SelectItem className="cursor-pointer" value="cash">
            Cash
          </SelectItem>
          <SelectItem className="cursor-pointer" value="mpesa">
            Mpesa
          </SelectItem>
          <SelectItem className="cursor-pointer" disabled value="paypal">
            Paypal
          </SelectItem>
          <SelectItem className="cursor-pointer" disabled value="paypal">
            Visa
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
