import { SaturnLensCard } from '@/lib/structuralStressEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SaturnLensCardsProps {
  cards: SaturnLensCard[];
}

const CARD_ICONS: Record<string, string> = {
  sign: '♄',
  house: '⌂',
  dispositor: '→'
};

export const SaturnLensCards = ({ cards }: SaturnLensCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} className="bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <span className="text-primary">{CARD_ICONS[card.type]}</span>
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {card.body.map((line, i) => (
                <li key={i} className="text-xs text-foreground/70 leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
