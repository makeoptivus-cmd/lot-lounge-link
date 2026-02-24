import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import EditableDetailRow from "./EditableDetailRow";
import { cn } from "@/lib/utils";

interface FieldDef {
    key: string;
    label: string;
    type?: "text" | "textarea";
}

interface EditableRecordProps {
    title: string;
    recordIndex: number;
    data: Record<string, any>;
    fields: FieldDef[];
    onUpdate: (updates: Record<string, any>) => void;
    onDelete: () => void;
    onHighlightToggle: (color: "orange" | "red" | "") => void;
    highlights: Record<string, "orange" | "red" | "">;
}

export default function EditableRecord({
    title,
    recordIndex,
    data,
    fields,
    onUpdate,
    onDelete,
    onHighlightToggle,
    highlights,
}: EditableRecordProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [highlightMenu, setHighlightMenu] = useState(false);

    const handleFieldSave = (fieldKey: string, newValue: string | any[]) => {
        onUpdate({ [fieldKey]: newValue });
    };

    const recordHighlight = highlights[data.id] || "";

    const bgColor =
        recordHighlight === "orange"
            ? "bg-orange-50/50"
            : recordHighlight === "red"
                ? "bg-red-50/50"
                : "";

    const borderColor =
        recordHighlight === "orange"
            ? "border-orange-200"
            : recordHighlight === "red"
                ? "border-red-200"
                : "border-border";

    return (
        <>
            <div
                className={cn(
                    "border rounded-lg p-3 space-y-3",
                    bgColor,
                    borderColor
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 flex-1 hover:opacity-70"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                        <h3 className="font-semibold text-sm">{title}</h3>
                    </button>

                    {/* Highlight Menu */}
                    <div className="relative">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setHighlightMenu(!highlightMenu)}
                            className="h-7 px-2 text-xs"
                            title="Highlight color"
                        >
                            {recordHighlight ? (
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded",
                                        recordHighlight === "orange" ? "bg-orange-400" : "bg-red-400"
                                    )}
                                />
                            ) : (
                                "Color"
                            )}
                        </Button>

                        {highlightMenu && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg p-2 space-y-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        onHighlightToggle("");
                                        setHighlightMenu(false);
                                    }}
                                    className="h-6 w-full text-xs justify-start"
                                >
                                    None
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        onHighlightToggle("orange");
                                        setHighlightMenu(false);
                                    }}
                                    className="h-6 w-full text-xs justify-start gap-2"
                                >
                                    <div className="w-3 h-3 rounded bg-orange-400" />
                                    Orange
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        onHighlightToggle("red");
                                        setHighlightMenu(false);
                                    }}
                                    className="h-6 w-full text-xs justify-start gap-2"
                                >
                                    <div className="w-3 h-3 rounded bg-red-400" />
                                    Red
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Delete Button */}
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="h-7 w-7 p-0"
                        title="Delete record"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="space-y-2 pt-2 border-t">
                        {fields.map((field) => (
                            <EditableDetailRow
                                key={field.key}
                                label={field.label}
                                value={data[field.key] || ""}
                                onSave={(newValue) => handleFieldSave(field.key, newValue)}
                                highlight={highlights[`${data.id}_${field.key}`] || ""}
                                isTextarea={field.type === "textarea"}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {title}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The record will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDelete();
                                setShowDeleteConfirm(false);
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
