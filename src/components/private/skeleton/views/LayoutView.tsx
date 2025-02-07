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
        
            <motion.div
                initial={false}
                animate={layoutViewMode} // Animation changes based on mode
                variants={{
                    standard: {
                        justifyContent: "center",
                        width: "50%", // Adjust width for standard mode
                    },
                    wide: {
                        justifyContent: "center",
                        width: "100%", // Adjust width for wide mode
                    },
                }}
                transition={{
                    duration: 0.5,
                    ease: "linear",
                }}
                className="flex flex-col w-full h-full bg-background text-foreground mx-auto"
            >
                {children}
            </motion.div>
    );
}

export default LayoutView;