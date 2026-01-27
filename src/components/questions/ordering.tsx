"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { OrderingContent } from "@/types";
import { Button } from "@/components/ui/button";
import { GripVertical, Check, X } from "lucide-react";

interface OrderingProps {
  content: OrderingContent;
  onAnswer: (correct: boolean) => void;
  disabled?: boolean;
}

export function Ordering({ content, onAnswer, disabled }: OrderingProps) {
  const [items, setItems] = useState<{ text: string; originalIndex: number }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Shuffle items initially
    const shuffled = content.items
      .map((text, originalIndex) => ({ text, originalIndex }))
      .sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, [content.items]);

  const handleDragStart = (index: number) => {
    if (disabled || showResult) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (fromIndex: number, direction: "up" | "down") => {
    if (disabled || showResult) return;

    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    [newItems[fromIndex], newItems[toIndex]] = [newItems[toIndex], newItems[fromIndex]];
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (disabled || showResult) return;

    setShowResult(true);

    const currentOrder = items.map(item => item.originalIndex);
    const isCorrect = content.correct_order.every(
      (correctIdx, position) => currentOrder[position] === correctIdx
    );

    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1500);
  };

  const isItemCorrect = (position: number) => {
    if (!showResult) return null;
    return items[position].originalIndex === content.correct_order[position];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
        {content.prompt}
      </h2>

      <div className="space-y-2">
        {items.map((item, index) => {
          const itemCorrect = isItemCorrect(index);

          return (
            <div
              key={item.originalIndex}
              draggable={!disabled && !showResult}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                {
                  "border-gray-200 hover:border-gray-300 cursor-grab": !showResult,
                  "border-green-500 bg-green-50": itemCorrect === true,
                  "border-red-500 bg-red-50": itemCorrect === false,
                  "opacity-50": draggedIndex === index,
                }
              )}
            >
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="flex-1 font-medium">{item.text}</span>

              {!showResult && (
                <div className="flex gap-1">
                  <button
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(index, "down")}
                    disabled={index === items.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              )}

              {itemCorrect === true && <Check className="w-5 h-5 text-green-600" />}
              {itemCorrect === false && <X className="w-5 h-5 text-red-600" />}
            </div>
          );
        })}
      </div>

      {!showResult && (
        <Button onClick={handleSubmit} disabled={disabled} className="w-full">
          Vérifier l&apos;ordre
        </Button>
      )}
    </div>
  );
}
