import { useState, useEffect } from "react";
import { Edit2, Save, X, Highlighter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HighlightableText from "@/components/HighlightableText";
import { TextHighlight } from "@/lib/storage";
import { cn } from "@/lib/utils";

// Predefined Nature of Land types
const LAND_TYPES = [
    "Agricultural",
    "Residential",
    "Commercial",
    "Industrial",
    "Mixed Use",
    "Pasture",
    "Forest",
    "Barren",
    "Plantation",
    "Water Body",
    "Other"
];

interface EditableDetailRowProps {
    label: string;
    value?: string | any[];
    onSave: (newValue: string | any[], highlights?: TextHighlight[]) => void;
    highlight?: "orange" | "red" | "";
    isTextarea?: boolean;
    textHighlights?: TextHighlight[];
    onTextHighlightsChange?: (highlights: TextHighlight[]) => void;
}

export default function EditableDetailRow({
    label,
    value = "",
    onSave,
    highlight = "",
    isTextarea = false,
    textHighlights = [],
    onTextHighlightsChange,
}: EditableDetailRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    // Handle both string and array values
    const stringValue = typeof value === 'string' ? value : '';
    const [editValue, setEditValue] = useState(stringValue);
    const [currentHighlights, setCurrentHighlights] = useState<TextHighlight[]>(textHighlights);
    
    // For Nature of Land editing
    const isNatureOfLand = label === "Nature of Land" && Array.isArray(value);
    const [editNatureItems, setEditNatureItems] = useState<any[]>(Array.isArray(value) ? value : []);

    // Sync editValue when value prop changes
    useEffect(() => {
        if (!isEditing) {
            setEditValue(stringValue);
            setCurrentHighlights(textHighlights);
            if (isNatureOfLand) {
                setEditNatureItems(Array.isArray(value) ? value : []);
            }
        }
    }, [stringValue, textHighlights, isEditing, value, isNatureOfLand]);

    const handleSave = () => {
        if (isNatureOfLand) {
            onSave(editNatureItems);
        } else {
            onSave(editValue, currentHighlights);
            onTextHighlightsChange?.(currentHighlights);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(stringValue);
        setCurrentHighlights(textHighlights);
        if (isNatureOfLand) {
            setEditNatureItems(Array.isArray(value) ? value : []);
        }
        setIsEditing(false);
    };

    const handleClickEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditValue(stringValue);
        setCurrentHighlights(textHighlights);
        setIsEditing(true);
    };

    const bgColor =
        highlight === "orange"
            ? "bg-orange-100/50"
            : highlight === "red"
                ? "bg-red-100/50"
                : "";

    const borderColor =
        highlight === "orange"
            ? "border-orange-300"
            : highlight === "red"
                ? "border-red-300"
                : "border-transparent";

    if (isEditing) {
        if (isNatureOfLand) {
            return (
                <div className={cn("py-1.5 px-2 rounded border-2 flex flex-col gap-3", bgColor, borderColor)}>
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    <div className="space-y-3">
                        {editNatureItems.map((item, idx) => (
                            <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded space-y-3">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-blue-900 block mb-1">Type</label>
                                        <select
                                            value={item.name || ''}
                                            onChange={(e) => {
                                                const updated = [...editNatureItems];
                                                updated[idx].name = e.target.value;
                                                setEditNatureItems(updated);
                                            }}
                                            className="w-full px-2 py-1.5 text-sm border border-blue-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-label="Land Type selector"
                                        >
                                            <option value="">Select Land Type</option>
                                            {LAND_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            setEditNatureItems(editNatureItems.filter((_, i) => i !== idx));
                                        }}
                                        className="h-8"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-blue-900 block mb-1">Details</label>
                                    <Textarea
                                        value={item.details || ''}
                                        onChange={(e) => {
                                            const updated = [...editNatureItems];
                                            updated[idx].details = e.target.value;
                                            setEditNatureItems(updated);
                                        }}
                                        placeholder="Describe the characteristics of this land..."
                                        className="text-sm h-16"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} className="h-7 gap-1">
                            <Save className="h-3 w-3" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 gap-1">
                            <X className="h-3 w-3" /> Cancel
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className={cn("py-1.5 px-2 rounded border-2 flex flex-col gap-3", bgColor, borderColor)}>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                {isTextarea ? (
                    <div className="space-y-2">
                        <div className="bg-muted/40 rounded border border-input p-2">
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <Highlighter className="h-3 w-3" />
                                Click and drag to highlight important parts
                            </p>
                            <HighlightableText
                                text={editValue}
                                highlights={currentHighlights}
                                onHighlightsChange={(newHighlights) => setCurrentHighlights(newHighlights)}
                                readOnly={false}
                            />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Or edit text directly:</p>
                            <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-20 p-2 rounded border border-input w-full text-sm"
                                placeholder={label}
                                title={label}
                            />
                        </div>
                    </div>
                ) : (
                    <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={label} autoFocus />
                )}
                <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} className="h-7 gap-1">
                        <Save className="h-3 w-3" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 gap-1">
                        <X className="h-3 w-3" /> Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "py-1.5 px-2 rounded border-2 flex flex-col gap-2",
                bgColor,
                borderColor
            )}
        >
            <div className="flex items-start justify-between gap-3 group">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClickEdit}
                    className="opacity-100 h-7 w-7 p-0 shrink-0"
                    title="Edit"
                >
                    <Edit2 className="h-3 w-3" />
                </Button>
            </div>
            <div 
                className="flex flex-col gap-0.5 flex-1 min-w-0 cursor-pointer hover:bg-muted/30 rounded p-1 transition-colors"
                onClick={(e) => {
                    handleClickEdit(e);
                }}
            >
                {value ? (
                    label === "Nature of Land" && typeof value === "object" && Array.isArray(value) ? (
                        <div className="space-y-2">
                            {(value as any).map((item: any, idx: number) => (
                                <div key={idx} className="p-2 bg-green-50/50 border border-green-200 rounded">
                                    <p className="text-sm font-semibold text-green-900">{item.name || item}</p>
                                    {item.details && (
                                        <p className="text-xs text-green-700 mt-1">{item.details}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <HighlightableText
                            text={typeof value === "string" ? value : String(value)}
                            highlights={currentHighlights}
                            onHighlightsChange={(newHighlights) => setCurrentHighlights(newHighlights)}
                            readOnly={true}
                        />
                    )
                ) : (
                    <span className="text-sm text-foreground">—</span>
                )}
            </div>
        </div>
    );
}
