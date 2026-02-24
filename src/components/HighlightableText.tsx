import { useState, useRef, useEffect } from "react";
import { Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextHighlight } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface HighlightableTextProps {
    text: string;
    onHighlightsChange?: (highlights: TextHighlight[]) => void;
    highlights?: TextHighlight[];
    readOnly?: boolean;
}

export default function HighlightableText({
    text,
    onHighlightsChange,
    highlights = [],
    readOnly = false,
}: HighlightableTextProps) {
    const [selectedText, setSelectedText] = useState("");
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef({ start: 0, end: 0, text: "" });

    const colors: Array<{
        name: string;
        value: "yellow" | "orange" | "red" | "blue" | "green";
        bgClass: string;
    }> = [
            { name: "Yellow", value: "yellow", bgClass: "bg-yellow-200" },
            { name: "Orange", value: "orange", bgClass: "bg-orange-200" },
            { name: "Red", value: "red", bgClass: "bg-red-200" },
            { name: "Blue", value: "blue", bgClass: "bg-blue-200" },
            { name: "Green", value: "green", bgClass: "bg-green-200" },
        ];

    const handleTextSelect = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            if (!textRef.current || !selection.anchorNode || !textRef.current.contains(selection.anchorNode)) {
                return;
            }
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(textRef.current!);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const start = preCaretRange.toString().length - selection.toString().length;
            const end = start + selection.toString().length;

            setSelectedText(selection.toString());
            setSelectionStart(start);
            setSelectionEnd(end);
            selectionRef.current = { start, end, text: selection.toString() };
            setShowColorMenu(true);
        }
    };

    const handleTouchSelect = () => {
        // Allow the OS selection UI to finish before reading selection.
        setTimeout(() => {
            handleTextSelect();
        }, 0);
    };

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.toString().length === 0) {
                if (!selectionRef.current.text) {
                    setShowColorMenu(false);
                }
                return;
            }
            if (!textRef.current || !selection.anchorNode || !textRef.current.contains(selection.anchorNode)) {
                return;
            }
            handleTextSelect();
        };

        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, []);

    const applyHighlight = (color: "yellow" | "orange" | "red" | "blue" | "green") => {
        const { start, end } = selectionRef.current;
        if (start !== end) {
            const newHighlight: TextHighlight = {
                start,
                end,
                color,
            };
            const updatedHighlights = [
                ...highlights.filter((h) => !(h.start === start && h.end === end)),
                newHighlight,
            ];
            onHighlightsChange?.(updatedHighlights);
            setShowColorMenu(false);
            window.getSelection()?.removeAllRanges();
            selectionRef.current = { start: 0, end: 0, text: "" };
        }
    };

    const removeHighlight = (index: number) => {
        const updatedHighlights = highlights.filter((_, i) => i !== index);
        onHighlightsChange?.(updatedHighlights);
    };

    const getBgColor = (color: string) => {
        const colorMap: Record<string, string> = {
            yellow: "bg-yellow-200",
            orange: "bg-orange-200",
            red: "bg-red-200",
            blue: "bg-blue-200",
            green: "bg-green-200",
        };
        return colorMap[color] || "";
    };

    const renderHighlightedText = () => {
        if (highlights.length === 0) return text;

        const segments: Array<{ text: string; highlight?: TextHighlight }> = [];
        let lastEnd = 0;

        const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

        for (const highlight of sortedHighlights) {
            if (lastEnd < highlight.start) {
                segments.push({ text: text.slice(lastEnd, highlight.start) });
            }
            segments.push({
                text: text.slice(highlight.start, highlight.end),
                highlight,
            });
            lastEnd = highlight.end;
        }

        if (lastEnd < text.length) {
            segments.push({ text: text.slice(lastEnd) });
        }

        return segments;
    };

    const segments = renderHighlightedText();

    return (
        <div className="space-y-2">
            <div
                ref={textRef}
                onMouseUp={!readOnly ? handleTextSelect : undefined}
                onTouchEnd={!readOnly ? handleTouchSelect : undefined}
                className={cn(
                    "p-3 rounded border border-input bg-background text-sm leading-relaxed whitespace-pre-wrap break-words",
                    !readOnly && "cursor-text select-text"
                )}
            >
                {typeof segments === "string" ? (
                    segments
                ) : (
                    <>
                        {segments.map((segment, idx) =>
                            segment.highlight ? (
                                <span
                                    key={idx}
                                    className={cn("cursor-pointer hover:opacity-75 transition-opacity", getBgColor(segment.highlight.color))}
                                    onClick={() => removeHighlight(highlights.indexOf(segment.highlight!))}
                                    title="Click to remove highlight"
                                >
                                    {segment.text}
                                </span>
                            ) : (
                                <span key={idx}>{segment.text}</span>
                            )
                        )}
                    </>
                )}
            </div>

            {selectedText && showColorMenu && (
                <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded border border-input bg-muted/95 p-2 backdrop-blur">
                    <Highlighter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Highlight as:</span>
                    {colors.map((color) => (
                        <Button
                            key={color.value}
                            size="sm"
                            variant="outline"
                            onClick={() => applyHighlight(color.value)}
                            className={cn("h-6 w-6 p-0", color.bgClass)}
                            title={`Highlight as ${color.name}`}
                        />
                    ))}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setShowColorMenu(false);
                            window.getSelection()?.removeAllRanges();
                            selectionRef.current = { start: 0, end: 0, text: "" };
                        }}
                        className="h-6 text-xs"
                    >
                        Cancel
                    </Button>
                </div>
            )}


        </div>
    );
}
