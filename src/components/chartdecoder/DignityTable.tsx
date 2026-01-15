import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartPlanet, generateDignityRows, getPlanetSymbol, getSignSymbol } from '@/lib/chartDecoderLogic';

interface DignityTableProps {
  planets: ChartPlanet[];
  onSelectPlanet?: (name: string) => void;
}

export const DignityTable: React.FC<DignityTableProps> = ({ planets, onSelectPlanet }) => {
  const rows = generateDignityRows(planets);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="w-[120px]">Planet</TableHead>
            <TableHead className="w-[100px]">Sign</TableHead>
            <TableHead className="w-[60px]">Degree</TableHead>
            <TableHead>Dignity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow 
              key={row.planet}
              className="cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => onSelectPlanet?.(row.planet)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlanetSymbol(row.planet)}</span>
                  <span>{row.planet}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>{getSignSymbol(row.sign)}</span>
                  <span className="text-muted-foreground text-sm">{row.sign}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.degree}</TableCell>
              <TableCell>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: row.color, 
                    color: row.color,
                    backgroundColor: `${row.color}15`
                  }}
                >
                  {row.dignityLabel}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
