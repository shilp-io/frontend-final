import { useEffect, useState, useRef } from 'react';
import type { Requirement } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { RequirementHeader } from '../base/RequirementHeader';
import { RequirementStatus } from '../base/RequirementStatus';
import { RequirementAnalysisForm } from '../base/RequirementAnalysisForm';
import { RequirementContent } from '../base/RequirementContent';
import { RequirementAssignment } from '../base/RequirementAssignment';
import { RequirementMetadata } from '../base/RequirementMetadata';
import { motion, AnimatePresence } from 'framer-motion';

interface RequirementPanelProps {
    requirement: Requirement;
    onUpdate?: (updatedRequirement: Requirement) => void;
}

export default function RequirementPanel({
    requirement,
    onUpdate,
}: RequirementPanelProps) {
    const [showCurrentReq, setShowCurrentReq] = useState(false);
    const [showHistoryReq, setShowHistoryReq] = useState(false);
    const [tempReqText, setTempReqText] = useState(
        requirement.original_req || '',
    );
    const [tempFormat, setTempFormat] = useState(
        requirement.selected_format || '',
    );
    const [editRequirement, setEditRequirement] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!requirement.original_req) {
            setEditRequirement(true);
        }
    }, [requirement]);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);

        const observer = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateWidth);
            observer.disconnect();
        };
    }, []);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTempReqText(e.target.value);
    };

    const handleFormatChange = (value: string) => {
        setTempFormat(value);
    };

    return (
        <div className="space-y-6 relative" ref={containerRef}>
            <RequirementHeader
                requirement={requirement}
                onViewCurrent={() => setShowCurrentReq(true)}
                onViewHistory={() => setShowHistoryReq(true)}
            />

            <RequirementStatus
                status={requirement.status}
                priority={requirement.priority}
            />

            <p className="text-muted-foreground">{requirement.description}</p>
            {editRequirement && (
                <RequirementAnalysisForm
                    requirement={requirement}
                    tempReqText={tempReqText}
                    tempFormat={tempFormat}
                    onFormatChange={handleFormatChange}
                    onTextChange={handleTextChange}
                    onUpdate={onUpdate || (() => {})}
                />
            )}

            {requirement.original_req &&
                (requirement.rewritten_ears ||
                    requirement.rewritten_incose) && (
                    <RequirementContent
                        requirement={requirement}
                        onFormatChange={handleFormatChange}
                        onTextChange={handleTextChange}
                        onUpdate={onUpdate || (() => {})}
                    />
                )}

            <RequirementAssignment
                assignedTo={requirement.assigned_to || undefined}
                reviewer={requirement.reviewer || undefined}
            />

            <RequirementMetadata
                acceptanceCriteria={
                    requirement.acceptance_criteria || undefined
                }
                tags={requirement.tags || undefined}
            />

            <AnimatePresence>
                {showCurrentReq && (
                    <motion.div
                        initial={{ x: containerWidth, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: containerWidth, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="fixed top-0 h-full w-[40vw] bg-background font-mono z-50"
                        style={{
                            boxShadow: `
                1px 0 0 0 rgb(0 0 0 / 0.05),
                2px 0 0 0 rgb(0 0 0 / 0.05),
                3px 0 0 0 rgb(0 0 0 / 0.05),
                0 1px 2px -1px rgb(0 0 0 / 0.1),
                0 2px 4px -2px rgb(0 0 0 / 0.1),
                0 4px 8px -4px rgb(0 0 0 / 0.1)
              `,
                            borderLeft: '1px solid rgb(0 0 0 / 0.1)',
                            borderTop: '1px solid rgb(0 0 0 / 0.1)',
                            borderBottom: '1px solid rgb(0 0 0 / 0.1)',
                            left: `${containerWidth}px`,
                        }}
                    >
                        <div className="p-6 h-full overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold font-mono">
                                    Current Requirement Analysis
                                </h2>
                                <button
                                    onClick={() => setShowCurrentReq(false)}
                                    className="p-2 hover:bg-accent rounded-md"
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                                            fill="currentColor"
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm">
                                {JSON.stringify(
                                    requirement.current_req,
                                    null,
                                    2,
                                )}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={showHistoryReq} onOpenChange={setShowHistoryReq}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Requirement Analysis History</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {requirement.history_req?.map((historyItem, index) => (
                            <div
                                key={index}
                                className="bg-muted p-4 rounded-lg"
                            >
                                <h4 className="font-semibold mb-2">
                                    Version {index + 1}
                                </h4>
                                <pre className="overflow-x-auto">
                                    {JSON.stringify(historyItem, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
