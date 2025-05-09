
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Menu, X } from "lucide-react";

type MobileSidebarTriggerProps = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  children: React.ReactNode;
};

const MobileSidebarTrigger: React.FC<MobileSidebarTriggerProps> = ({ 
  menuOpen, 
  setMenuOpen,
  children 
}) => {
  return (
    <div className="fixed top-4 left-4 z-40">
      <Collapsible open={menuOpen} onOpenChange={setMenuOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="icon">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="fixed top-16 left-0 z-30 w-64 shadow-lg bg-white">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MobileSidebarTrigger;
