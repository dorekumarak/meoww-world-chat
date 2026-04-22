import React, { useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({
  onEmojiSelect,
  onClose,
  isDarkMode,
  buttonRef
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, buttonRef]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div
      ref={pickerRef}
      className={`absolute bottom-20 left-4 z-50 ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      <div className={`rounded-lg shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
          width={320}
          height={400}
          previewConfig={{
            showPreview: false,
            defaultCaption: 'Frequently Used',
            defaultEmoji: '1f60a'
          }}
          skinTonesDisabled
          searchDisabled={false}
        />
      </div>
    </div>
  );
};

export default EmojiPickerComponent;
