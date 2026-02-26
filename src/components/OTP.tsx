import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';

interface OtpInputProps {
  length: number;
  onComplete: (otp: string) => void;
  onKeyPress?: (e: KeyboardEvent) => void;
  autoFocus?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ 
  length, 
  onComplete, 
  onKeyPress,
  autoFocus = false 
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const otpValue = newOtp.join('');
    if (otpValue.length === length) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (onKeyPress) {
      onKeyPress(event);
    }

    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      // Read from clipboard
      const text = await navigator.clipboard.readText();
      
      // Extract only numbers from the pasted text
      const numbers = text.replace(/\D/g, '').split('');
      
      // Create new OTP array
      const newOtp = [...otp];
      
      // Fill in the numbers starting from first input
      numbers.slice(0, length).forEach((num, index) => {
        newOtp[index] = num;
      });
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last input if all filled
      const nextEmptyIndex = newOtp.findIndex(val => val === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[length - 1]?.focus();
        // Trigger onComplete if all fields are filled
        const otpValue = newOtp.join('');
        if (otpValue.length === length) {
          onComplete(otpValue);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const setInputRef = (index: number) => (ref: HTMLInputElement | null) => {
    inputRefs.current[index] = ref;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 justify-center">
        {otp.map((value, index) => (
          <input
            key={index}
            type="number"
            maxLength={1}
            value={value}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            ref={setInputRef(index)}
            className="w-10 h-12 text-center text-xl font-bold bg-bull-dark border border-white/10 rounded-xl focus:outline-none focus:border-bull-orange transition-colors"
          />
        ))}
      </div>
      <button
        onClick={handlePaste}
        className="px-3 py-1 text-sm text-white/70 hover:text-white border border-white/10 hover:border-bull-orange rounded-lg transition-colors"
      >
        Paste
      </button>
    </div>
  );
};

export default OtpInput;