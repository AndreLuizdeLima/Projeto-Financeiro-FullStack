import CardInfoIcon from "@/components/CardInfoIcon";
import { Card } from "@/components/ui/card";

import { useCardsViewModel } from "../view-model/useCardsViewModel";

const CardsView = ({ mes }: { mes: string }) => {
  const { cardsBuild, error } = useCardsViewModel(mes);

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <div>
      <Card className="p-2 grid grid-cols-3 gap-2">
        {cardsBuild.map((i, index) => (
          <CardInfoIcon key={index} {...i} />
        ))}
      </Card>
    </div>
  );
};

export default CardsView;
