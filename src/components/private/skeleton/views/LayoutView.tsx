"use client";

import { useAppStore } from "@/lib/store/appStore";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LayoutViewProps {
    children: ReactNode;
}

function LayoutView({ children }: LayoutViewProps) {
    const { layoutViewMode } = useAppStore();

    return (
        <div className="flex bg-background justify-center min-h-screen">
            <motion.div
                initial={false}
                animate={layoutViewMode} // Animation changes based on mode
                variants={{
                    standard: {
                        justifyContent: "center",
                        padding: "2rem",
                        width: "50%", // Adjust width for standard mode
                    },
                    wide: {
                        justifyContent: "flex-start",
                        padding: "2rem",
                        width: "100%", // Adjust width for wide mode
                    },
                }}
                transition={{
                    duration: 0.5,
                    ease: "linear",
                }}
                className="flex flex-col w-full bg-background text-foreground"
            >
                {children}
            </motion.div>
        </div>
        //</div>
    );
}

export default LayoutView;