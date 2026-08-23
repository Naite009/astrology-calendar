/**
 * A Sanskrit or technical term with its plain translation attached.
 * Hover or tap shows the definition, so no term is ever unexplained.
 */

import { glossaryFor } from '@/lib/vedic/glossary';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  term: string;
  /** Optional display label if it differs from the glossary key */
  children?: React.ReactNode;
}

export const VedicTerm = ({ term, children }: Props) => {
  const def = glossaryFor(term);
  if (!def) return <>{children || term}</>;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="underline decoration-dotted decoration-primary/60 underline-offset-2 hover:text-primary"
        >
          {children || term}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-[13px] leading-relaxed">
        <span className="font-medium">{term}. </span>
        {def}
      </PopoverContent>
    </Popover>
  );
};
