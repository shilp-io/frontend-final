'use client';

import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils/dateUtils';
import { useRequirement } from '@/hooks/db/useRequirement';

const ASCII_STYLES = {
  container: 'font-mono whitespace-pre overflow-x-auto p-8 text-sm bg-white rounded-lg shadow-sm',
  section: 'mb-2',
  row: 'hover:bg-gray-50 transition-colors duration-150',
  loading: 'animate-pulse text-gray-500',
  error: 'text-red-500',
};

const TOTAL_WIDTH = 70; // Reduced width for better display
const INNER_WIDTH = TOTAL_WIDTH - 2; // Account for borders

function truncateAndPad(text: string | null, length: number): string {
  if (!text) return ''.padEnd(length);
  return text.slice(0, length).padEnd(length);
}

function wrapText(text: string | null, width: number): string[] {
  if (!text) return ['-'];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : ['-'];
}

export default function RequirementPage() {
  const params = useParams();
  const reqId = params.reqId as string;
  const { requirement, isLoading, error } = useRequirement(reqId);

  const box = {
    top: `┌${'─'.repeat(INNER_WIDTH)}┐`,
    middle: `├${'─'.repeat(INNER_WIDTH)}┤`,
    bottom: `└${'─'.repeat(INNER_WIDTH)}┘`,
    vertical: '│',
  };


  const renderLine = (content: string) => 
    `${box.vertical} ${truncateAndPad(content, INNER_WIDTH - 1)}${box.vertical}\n`;

  if (isLoading) {
    return (
      <div className={`${ASCII_STYLES.container} ${ASCII_STYLES.loading}`}>
        {box.top + '\n'}
        {renderLine('Loading requirement...')}
        {box.bottom}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${ASCII_STYLES.container} ${ASCII_STYLES.error}`}>
        ┌────────────────────────────┐
        │ Error: {error.message.padEnd(20)} │
        └────────────────────────────┘
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className={`${ASCII_STYLES.container} ${ASCII_STYLES.error}`}>
        ┌────────────────────────────┐
        │    Requirement not found   │
        └────────────────────────────┘
      </div>
    );
  }

  const descriptionLines = wrapText(requirement.description, 68);
  const acceptanceCriteria = requirement.acceptance_criteria || [];
  const borderChar = '─';
  const width = 78;

  return (
    <div className={`${ASCII_STYLES.container} select-text`}>
      {/* Header */}
      <div className={ASCII_STYLES.section}>
        {`┌${borderChar.repeat(width)}┐`}
        {'\n'}
        {`│ ${requirement.title.toUpperCase().padEnd(width - 2)} │`}
        {'\n'}
        {`├${borderChar.repeat(width)}┤`}
      </div>

      {/* Metadata */}
      <div className={`${ASCII_STYLES.section} text-gray-600`}>
        {`│ Status: ${requirement.status.toLowerCase().padEnd(20)} Priority: ${requirement.priority.toLowerCase().padEnd(20)} │`}
        {'\n'}
        {`│ Created: ${formatDate(requirement.created_at)?.padEnd(19) || '-'.padEnd(19)} Updated: ${formatDate(requirement.updated_at)?.padEnd(19) || '-'.padEnd(19)} │`}
        {'\n'}
        {`│ Assigned To: ${(requirement.assigned_to || '-').padEnd(18)} Reviewer: ${(requirement.reviewer || '-').padEnd(20)} │`}
        {'\n'}
        {`├${borderChar.repeat(width)}┤`}
      </div>

      {/* Description */}
      <div className={ASCII_STYLES.section}>
        {`│ Description:${' '.repeat(width - 13)} │`}
        {'\n'}
        {descriptionLines.map((line, i) => 
          `│ ${line.padEnd(width - 2)} │\n`
        )}
        {`├${borderChar.repeat(width)}┤`}
      </div>

      {/* Acceptance Criteria */}
      <div className={ASCII_STYLES.section}>
        {`│ Acceptance Criteria:${' '.repeat(width - 21)} │`}
        {'\n'}
        {acceptanceCriteria.length > 0 ? (
          acceptanceCriteria.map((criteria, i) => 
            `│ ${(i + 1).toString().padStart(2)}. ${criteria.padEnd(width - 5)} │\n`
          )
        ) : (
          `│ No acceptance criteria defined${' '.repeat(width - 29)} │\n`
        )}
        {`├${borderChar.repeat(width)}┤`}
      </div>

      {/* Tags */}
      <div className={ASCII_STYLES.section}>
        {`│ Tags: ${(requirement.tags || []).join(', ').padEnd(width - 8)} │`}
        {'\n'}
        {`└${borderChar.repeat(width)}┘`}
      </div>
    </div>
  );
}
