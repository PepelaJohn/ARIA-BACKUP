import React, { useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface FilterableSelectProps {
  setValue: (value: string) => void;
  options: Option[];
  className?: string;
  selectedCountry: string;
}

const FilterableSelect: React.FC<FilterableSelectProps> = ({
  setValue,
  options,
  className,
  selectedCountry,
}) => {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // console.log(options);
  if(!selectedCountry){

  }

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (value: string) => {
    // alert(value)
    setValue(value);
    setIsOpen(false);
  };

  return (
    <div className={`relative h-full ${className}`}>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full outline-none bg-transparent h-full "
        // onBlur={() => setIsOpen(false)}
        placeholder="Search or select..."
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  setFilter(option.label.split(" ")[1]);
                  handleSelect(option.label.split(" ")[1]);
                }}
                className="px-3 py-2 cursor-pointer hover:bg-gray-200 "
              >
                {option.label.split(" ")[1]}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default FilterableSelect;
