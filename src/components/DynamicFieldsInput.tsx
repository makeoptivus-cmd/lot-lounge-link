import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DynamicField {
    id: string;
    label: string;
    value: string;
}

interface DynamicFieldsInputProps {
    fields: DynamicField[];
    onFieldsChange: (fields: DynamicField[]) => void;
    title?: string;
    isTextarea?: boolean;
}

export default function DynamicFieldsInput({
    fields,
    onFieldsChange,
    title = "Additional Details",
    isTextarea = false,
}: DynamicFieldsInputProps) {
    const [newLabel, setNewLabel] = useState("");
    const [newValue, setNewValue] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [editValue, setEditValue] = useState("");

    const handleAddField = () => {
        if (newLabel.trim() && newValue.trim()) {
            const updatedFields = [
                ...fields,
                {
                    id: crypto.randomUUID(),
                    label: newLabel,
                    value: newValue,
                },
            ];
            onFieldsChange(updatedFields);
            setNewLabel("");
            setNewValue("");
        }
    };

    const handleDeleteField = (id: string) => {
        const updatedFields = fields.filter((f) => f.id !== id);
        onFieldsChange(updatedFields);
    };

    const handleStartEdit = (field: DynamicField) => {
        setEditingId(field.id);
        setEditLabel(field.label);
        setEditValue(field.value);
    };

    const handleSaveEdit = () => {
        if (editLabel.trim() && editValue.trim()) {
            const updatedFields = fields.map((f) =>
                f.id === editingId
                    ? { ...f, label: editLabel, value: editValue }
                    : f
            );
            onFieldsChange(updatedFields);
            setEditingId(null);
            setEditLabel("");
            setEditValue("");
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditLabel("");
        setEditValue("");
    };

    return (
        <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-4">{title}</h3>

                {/* Display existing fields */}
                {fields.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {fields.map((field) =>
                            editingId === field.id ? (
                                <div
                                    key={field.id}
                                    className="p-3 bg-white border border-blue-300 rounded flex flex-col gap-2"
                                >
                                    <Input
                                        placeholder="Field name"
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        className="text-sm"
                                    />
                                    {isTextarea ? (
                                        <Textarea
                                            placeholder="Field value"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="text-sm h-16"
                                        />
                                    ) : (
                                        <Input
                                            placeholder="Field value"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="text-sm"
                                        />
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handleSaveEdit}
                                            className="h-7 gap-1"
                                        >
                                            <Save className="h-3 w-3" /> Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCancelEdit}
                                            className="h-7 gap-1"
                                        >
                                            <X className="h-3 w-3" /> Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key={field.id}
                                    className="p-2 bg-white border border-blue-200 rounded flex items-start justify-between gap-2 group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-blue-900">
                                            {field.label}
                                        </p>
                                        <p className="text-sm text-foreground mt-0.5 break-words">
                                            {field.value}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleStartEdit(field)}
                                            className="h-6 w-6 p-0"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDeleteField(field.id)}
                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Add new field form */}
                <div className="space-y-2 p-3 bg-white rounded border border-blue-300">
                    <p className="text-xs font-medium text-blue-900 flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Add {title}
                    </p>
                    <Input
                        placeholder="Field name (e.g., Notes, References)"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="text-sm"
                    />
                    {isTextarea ? (
                        <Textarea
                            placeholder="Field value"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            className="text-sm h-20"
                        />
                    ) : (
                        <Input
                            placeholder="Field value"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            className="text-sm"
                        />
                    )}
                    <Button
                        size="sm"
                        onClick={handleAddField}
                        className="w-full h-7 gap-1"
                        disabled={!newLabel.trim() || !newValue.trim()}
                    >
                        <Plus className="h-3 w-3" /> Add Field
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
