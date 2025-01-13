'use client';

import React, { useEffect, useState } from 'react';
import {
    FileText,
    Users,
    Book,
    Network,
    Zap,
    Shield,
    BarChart2,
    Cloud,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { memo } from 'react';
import { useInView } from 'react-intersection-observer';
import PublicHeader from '@/components/public/PublicHeader';

const FIXED_POSITIONS = [
    { top: 5, right: 10 },
    { top: 15, left: 8 },
    { top: 25, right: 15 },
    { top: 10, left: 20 },
    { top: 20, right: 5 },
    { top: 8, left: 15 },
    { top: 18, right: 12 },
    { top: 12, left: 10 },
];

const ParticleIcon = memo(
    ({
        icon: Icon,
        delay,
        position,
    }: {
        icon: React.ComponentType<{ className?: string }>;
        delay: number;
        position: { top?: number; right?: number; left?: number };
    }) => {
        const { ref, inView } = useInView({
            triggerOnce: true,
            threshold: 0.1,
        });

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0 }}
                animate={
                    inView
                        ? {
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                              transition: {
                                  duration: 2,
                                  delay: delay,
                                  times: [0, 0.5, 1],
                                  ease: ['easeOut', 'easeIn'],
                              },
                          }
                        : {}
                }
                className="absolute"
                style={{
                    top: `${position.top}%`,
                    ...(position.right
                        ? { right: `${position.right}%` }
                        : { left: `${position.left}%` }),
                }}
            >
                <Icon className="w-6 h-6 text-orange-500 dark:text-orange-400 opacity-50" />
            </motion.div>
        );
    },
);
ParticleIcon.displayName = 'ParticleIcon';

const containerVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            staggerChildren: 0.2,
            delayChildren: 0.3,
            duration: 0.5,
            when: 'beforeChildren',
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

const icons = [FileText, Users, Book, Network, Zap, Shield, BarChart2, Cloud];

export const metadata = {
    title: 'AI-Powered Requirements Engineering',
    description:
        'Analyze engineering requirements against regulatory documents with advanced AI.',
};

const LandingPage = () => {
    // Optimize icons rendering
    const [mountIcons, setMountIcons] = useState(false);

    useEffect(() => {
        // Defer icons mounting
        const timer = setTimeout(() => setMountIcons(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 relative overflow-hidden">
            <PublicHeader />
            <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-gray-50/50 to-gray-100 dark:via-gray-900/50 dark:to-gray-950 opacity-20" />

            {/* Only render particles when needed */}
            {mountIcons &&
                icons.map((Icon, index) => (
                    <ParticleIcon
                        key={index}
                        icon={Icon}
                        delay={index * 0.5}
                        position={FIXED_POSITIONS[index]}
                    />
                ))}

            <ScrollAnimatedHeader />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }} // Reduce threshold
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={
                            <FileText className="w-8 h-8 text-red-500 dark:text-red-400" />
                        }
                        title="Project Management"
                        description="Organize requirements into projects, track progress, and manage analysis history efficiently."
                    />
                    <FeatureCard
                        icon={
                            <Zap className="w-8 h-8 text-red-500 dark:text-red-400" />
                        }
                        title="AI Analysis"
                        description="Leverage advanced AI to analyze requirements against regulatory documents automatically."
                    />
                    <FeatureCard
                        icon={
                            <Book className="w-8 h-8 text-red-500 dark:text-red-400" />
                        }
                        title="Regulation Library"
                        description="Access and manage a comprehensive library of regulatory documents and standards."
                    />
                    <FeatureCard
                        icon={
                            <Network className="w-8 h-8 text-red-500 dark:text-red-400" />
                        }
                        title="Collaboration Graph"
                        description="Visualize relationships between requirements and regulations in an interactive graph."
                    />
                    <FeatureCard
                        icon={
                            <Shield className="w-8 h-8 text-red-500 dark:text-red-400" />
                        }
                        title="Compliance Tracking"
                        description="Monitor compliance status and get alerts for potential regulatory issues."
                    />
                    <FeatureCard
                        icon={
                            <BarChart2 className="w-8 h-8 text-red-500 dark:text-red-400" />
                        }
                        title="Analytics Dashboard"
                        description="Get insights into your requirements and compliance status with detailed analytics."
                    />
                </div>
            </motion.div>

            <div className="bg-gray-50 dark:bg-gray-800 transition-colors duration-200 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50 mb-12"
                    >
                        How It Works
                    </motion.h2>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <Step
                            number="1"
                            title="Upload Requirements"
                            description="Import your engineering requirements and regulatory documents into the system."
                        />
                        <Step
                            number="2"
                            title="AI Analysis"
                            description="Our AI engine analyzes requirements against regulatory documents automatically."
                        />
                        <Step
                            number="3"
                            title="Track Compliance"
                            description="Monitor compliance status and collaborate with your team to resolve issues."
                        />
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
            >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-6">
                    Ready to streamline your requirements engineering?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Join leading engineering teams who trust our platform for
                    their regulatory compliance needs.
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-lg transition-all duration-200 shadow-lg dark:shadow-red-900/20"
                >
                    Start Free Trial
                </motion.button>
            </motion.div>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

// Memoize feature card
const FeatureCard = memo(({ icon, title, description }: FeatureCardProps) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <motion.div
            ref={ref}
            variants={itemVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/20 hover:shadow-md dark:hover:shadow-gray-900/30"
        >
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </motion.div>
    );
});
FeatureCard.displayName = 'FeatureCard';

interface StepProps {
    number: string;
    title: string;
    description: string;
}

const Step = ({ number, title, description }: StepProps) => (
    <motion.div variants={itemVariants} className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-600 dark:bg-red-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg dark:shadow-red-900/30">
            {number}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
            {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
);

// Optimize scroll header
const ScrollAnimatedHeader = memo(() => {
    const { scrollY } = useScroll({
        layoutEffect: false,
    });

    const scale = useTransform(scrollY, [0, 300], [1, 1.2], {
        clamp: true,
    });
    const opacity = useTransform(scrollY, [0, 300], [1, 0.8], {
        clamp: true,
    });

    return (
        <motion.div className="relative z-10" style={{ scale, opacity }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
                <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-50 mb-6"
                >
                    AI-Powered Requirements Engineering
                </motion.h1>
                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
                >
                    Analyze engineering requirements against regulatory
                    documents with advanced AI. Ensure compliance and save time
                    with automated analysis.
                </motion.p>
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                    className="flex justify-center gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg dark:shadow-red-900/20"
                    >
                        Get Started
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    >
                        Watch Demo
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
});
ScrollAnimatedHeader.displayName = 'ScrollAnimatedHeader';

// Export memoized component
export default memo(LandingPage);
