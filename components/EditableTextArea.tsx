"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { Button, Tooltip } from "antd";
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    CheckSquareOutlined,
} from "@ant-design/icons";

interface EditableTextAreaProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    fontSize?: number;
    minHeight?: number;
    maxHeight?: number;
    bordered?: boolean;
    initialHtml?: string;
    style?: React.CSSProperties;
}

const EditableTextArea: React.FC<EditableTextAreaProps> = ({
    value,
    onChange,
    placeholder = "Type something…",
    fontSize = 16,
    minHeight = 80,
    maxHeight = 200,
    bordered = false,
    initialHtml,
    style,
}) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const savedRange = useRef<Range | null>(null);

    /* ── Populate editor with initial HTML when it first mounts or when initialHtml changes ── */
    useEffect(() => {
        if (editorRef.current && initialHtml !== undefined) {
            editorRef.current.innerHTML = initialHtml;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialHtml]);

    /* ── Save / restore selection so toolbar clicks don't lose focus ── */
    const saveSelection = useCallback(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRange.current = sel.getRangeAt(0);
        }
    }, []);

    const restoreSelection = useCallback(() => {
        const sel = window.getSelection();
        if (sel && savedRange.current) {
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
        }
    }, []);

    /** Prevent toolbar buttons from stealing focus */
    const preventFocusLoss = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    /** Run execCommand on the current selection */
    const execFormat = useCallback(
        (command: string, val?: string) => {
            restoreSelection();
            document.execCommand(command, false, val);
            if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
            }
            saveSelection();
        },
        [onChange, restoreSelection, saveSelection]
    );

    /** Insert a macOS-style checklist item */
    const insertChecklist = useCallback(() => {
        restoreSelection();
        const id = `chk-${Date.now()}`;
        const html =
            `<div class="checklist-item">` +
            `<input type="checkbox" id="${id}"/>` +
            `<span contenteditable="true">&nbsp;</span>` +
            `</div><div><br/></div>`;
        document.execCommand("insertHTML", false, html);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
        saveSelection();
    }, [onChange, restoreSelection, saveSelection]);

    /** Sync contentEditable → state */
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    return (
        <div style={style}>
            {/* ── Toolbar ── */}
            <div
                style={{
                    display: "flex",
                    gap: 4,
                    padding: "4px 0 8px",
                    borderBottom: "1px solid #f0f0f0",
                    marginBottom: 8,
                }}
            >
                <Tooltip title="Bold">
                    <Button
                        type="text"
                        size="small"
                        icon={<BoldOutlined />}
                        onMouseDown={preventFocusLoss}
                        onClick={() => execFormat("bold")}
                    />
                </Tooltip>
                <Tooltip title="Italic">
                    <Button
                        type="text"
                        size="small"
                        icon={<ItalicOutlined />}
                        onMouseDown={preventFocusLoss}
                        onClick={() => execFormat("italic")}
                    />
                </Tooltip>
                <Tooltip title="Underline">
                    <Button
                        type="text"
                        size="small"
                        icon={<UnderlineOutlined />}
                        onMouseDown={preventFocusLoss}
                        onClick={() => execFormat("underline")}
                    />
                </Tooltip>
                <Tooltip title="Strikethrough">
                    <Button
                        type="text"
                        size="small"
                        icon={<StrikethroughOutlined />}
                        onMouseDown={preventFocusLoss}
                        onClick={() => execFormat("strikeThrough")}
                    />
                </Tooltip>
                <Tooltip title="Checklist">
                    <Button
                        type="text"
                        size="small"
                        icon={<CheckSquareOutlined />}
                        onMouseDown={preventFocusLoss}
                        onClick={insertChecklist}
                    />
                </Tooltip>
            </div>

            {/* ── Editable area ── */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                onSelect={saveSelection}
                data-placeholder={placeholder}
                style={{
                    minHeight,
                    maxHeight,
                    overflowY: "auto",
                    fontSize,
                    padding: bordered ? 8 : "8px 0",
                    outline: "none",
                    lineHeight: 1.6,
                    wordBreak: "break-word",
                    border: bordered ? "1px solid #d9d9d9" : "none",
                    borderRadius: bordered ? 8 : 0,
                }}
            />
        </div>
    );
};

export default EditableTextArea;
