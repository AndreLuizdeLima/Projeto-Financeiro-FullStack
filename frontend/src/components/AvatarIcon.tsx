import { useAuth } from "@/auth/useAuth";
import { Avatar, AvatarBadge, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

const AvatarIcon = () => {
  const { logout } = useAuth();

  return (
    <article>
      <Popover>
        <PopoverTrigger>
          <Avatar size="lg">
            <AvatarFallback>A</AvatarFallback>
            <AvatarBadge className="bg-green-600 dark:bg-green-800" />
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className={"max-w-32"}>
          <div className="flex flex-col gap-2">
            <Button variant={"default"} onClick={() => logout()}>
              <LogOut /> Sair
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </article>
  );
};

export default AvatarIcon;
