import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCustomerAuth } from "../hooks/useCustomerAuth";

export function Navbar() {
  const { user, logout, isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
      <Link
        to="/"
        className="font-display font-bold text-xl text-primary mint-text-glow tracking-tight"
      >
        Re<span className="text-foreground">Genix</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          data-ocid="nav.browse.link"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Browse
        </Link>
        <Link
          to="/sell"
          data-ocid="nav.sell.link"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Sell Your Phone
        </Link>

        {isLoggedIn && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              data-ocid="nav.user.dropdown_menu"
              className="flex items-center gap-2 text-sm text-foreground border border-border rounded-full px-3 py-1.5 hover:border-primary/50 transition-colors bg-card"
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs text-primary font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">{user.name}</span>
              <span className="text-muted-foreground text-xs">▾</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                data-ocid="nav.my_orders.link"
                className="text-sm cursor-pointer"
              >
                My Orders
              </DropdownMenuItem>
              <DropdownMenuItem
                data-ocid="nav.logout.button"
                onClick={handleLogout}
                className="text-sm text-destructive cursor-pointer focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/login"
            data-ocid="nav.login.link"
            className="text-sm text-muted-foreground border border-border rounded-md px-3 py-1.5 hover:border-primary/50 hover:text-foreground transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
