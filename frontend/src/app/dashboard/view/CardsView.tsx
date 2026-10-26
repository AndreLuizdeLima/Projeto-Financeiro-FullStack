import CardInfoIcon from "@/components/CardInfoIcon";
import { Card } from "@/components/ui/card";

import { useCardsViewModel } from "../view-model/useCardsViewModel";

const CardsView = () => {
  const { cardsBuild } = useCardsViewModel();

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
