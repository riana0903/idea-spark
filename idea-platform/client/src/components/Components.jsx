import React, { useState, useEffect, useRef } from 'react';

/**
 * 統合された入力コンポーネント
 * - CategorySelect
 * - TagInput
 * - StarRating
 * を一つのファイルに統合
 */

/**
 * CategorySelect Component
 * A dropdown component for selecting categories with support for search and multi-select
 * 
 * @param {Object} props
 * @param {Array} props.categories - Array of category objects with id and name properties
 * @param {Array|string|number} props.selected - Initial selected category id(s)
 * @param {Function} props.onChange - Callback function when selection changes
 * @param {boolean} props.multiSelect - Enable multi-select mode (default: false)
 * @param {boolean} props.searchable - Enable search functionality (default: true)
 * @param {string} props.placeholder - Placeholder text when nothing is selected
 */
export const CategorySelect = ({
  categories = [],
  selected = [],
  onChange,
  multiSelect = false,
  searchable = true,
  placeholder = "Select a category"
}) => {
  // Convert initial selection to array for consistency
  const initialSelection = Array.isArray(selected) ? selected : selected ? [selected] : [];
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(initialSelection);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSelect = (categoryId) => {
    let newSelectedIds;
    
    if (multiSelect) {
      // Toggle selection in multi-select mode
      if (selectedIds.includes(categoryId)) {
        newSelectedIds = selectedIds.filter(id => id !== categoryId);
      } else {
        newSelectedIds = [...selectedIds, categoryId];
      }
    } else {
      // Single select mode
      newSelectedIds = [categoryId];
      setIsOpen(false);
    }
    
    setSelectedIds(newSelectedIds);
    
    if (onChange) {
      onChange(multiSelect ? newSelectedIds : newSelectedIds[0]);
    }
  };

  const getSelectedCategoryNames = () => {
    if (selectedIds.length === 0) return placeholder;
    
    return categories
      .filter(category => selectedIds.includes(category.id))
      .map(category => category.name)
      .join(', ');
  };

  const filteredCategories = searchTerm
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : categories;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex justify-between items-center px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {getSelectedCategoryNames()}
        </span>
        <span className="ml-2">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <div className="sticky top-0 p-2 bg-white border-b border-gray-300">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <ul className="py-1" role="listbox">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <li
                  key={category.id}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    selectedIds.includes(category.id) ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleSelect(category.id)}
                  role="option"
                  aria-selected={selectedIds.includes(category.id)}
                >
                  <div className="flex items-center">
                    {multiSelect && (
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedIds.includes(category.id)}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    {category.name}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No categories found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * TagInput Component
 * A component for inputting multiple tags with customizable options
 * 
 * @param {Object} props
 * @param {Array} props.initialTags - Initial array of tags
 * @param {Function} props.onChange - Callback function when tags change
 * @param {number} props.maxTags - Maximum number of tags allowed (default: unlimited)
 * @param {string} props.placeholder - Input placeholder text
 * @param {boolean} props.allowDuplicates - Whether to allow duplicate tags (default: false)
 */
export const TagInput = ({
  initialTags = [],
  onChange,
  maxTags = Infinity,
  placeholder = "Add tags...",
  allowDuplicates = false
}) => {
  const [tags, setTags] = useState(initialTags);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const tagContainerRef = useRef(null);

  useEffect(() => {
    if (onChange) {
      onChange(tags);
    }
  }, [tags, onChange]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const addTag = (tag) => {
    if (!tag.trim()) return;
    
    // Check if tag already exists and duplicates aren't allowed
    if (!allowDuplicates && tags.includes(tag.trim())) return;
    
    // Check if we've reached the maximum number of tags
    if (tags.length >= maxTags) return;
    
    const newTags = [...tags, tag.trim()];
    setTags(newTags);
    setInputValue('');
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
  };

  const handleKeyDown = (e) => {
    // Add tag on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
    
    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue) {
      addTag(inputValue);
    }
  };

  return (
    <div 
      className="flex flex-wrap items-center border border-gray-300 rounded p-2 focus-within:border-blue-500"
      ref={tagContainerRef}
      onClick={() => inputRef.current.focus()}
    >
      {tags.map((tag, index) => (
        <div 
          key={index} 
          className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm m-1 flex items-center"
        >
          <span>{tag}</span>
          <button
            type="button"
            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(index);
            }}
            aria-label={`Remove tag ${tag}`}
          >
            &times;
          </button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-grow outline-none px-2 py-1 min-w-24"
        disabled={tags.length >= maxTags}
      />
      {tags.length >= maxTags && (
        <span className="text-xs text-gray-500 ml-2">
          Maximum tags reached
        </span>
      )}
    </div>
  );
};

/**
 * StarRating Component
 * A customizable star rating component for React applications
 * 
 * @param {Object} props
 * @param {number} props.initialRating - Initial rating value (default: 0)
 * @param {number} props.maxRating - Maximum number of stars (default: 5)
 * @param {string} props.size - Size of stars (small, medium, large) (default: medium)
 * @param {Function} props.onChange - Callback function when rating changes
 * @param {boolean} props.readOnly - Whether the rating can be changed (default: false)
 */
export const StarRating = ({ 
  initialRating = 0, 
  maxRating = 5, 
  size = "medium", 
  onChange,
  readOnly = false
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  // Determine star size based on prop
  const getSizeClass = () => {
    switch(size) {
      case "small": return "text-lg";
      case "large": return "text-3xl";
      default: return "text-2xl";
    }
  };

  const handleClick = (index) => {
    if (readOnly) return;
    
    const newRating = index + 1;
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  const handleMouseEnter = (index) => {
    if (readOnly) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => {
        const filled = index < (hoverRating || rating);
        
        return (
          <span
            key={index}
            className={`${getSizeClass()} cursor-pointer ${readOnly ? 'cursor-default' : ''} mx-0.5`}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            role={readOnly ? "presentation" : "button"}
            aria-label={`Rate ${index + 1} of ${maxRating} stars`}
          >
            {filled ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </span>
        );
      })}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 ? `${rating} of ${maxRating}` : ""}
      </span>
    </div>
  );
};