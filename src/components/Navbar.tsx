import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, User, Building2, Sun, Moon, Sparkles } from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const location = useLocation()
  const isHomepage = location.pathname === '/'

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(currentTheme)
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const getFullName = (email: string) => {
    // Extract name from email (part before @) and capitalize first letter
    const namePart = email.split('@')[0]
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PromptForge
              </h1>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground border-l border-border/50 pl-3">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">ZeroXTech</span>
                <span className="text-xs opacity-70">|</span>
                <span className="text-xs opacity-70">Chaitanya</span>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Tabs - Only show on homepage */}
            {isHomepage && (
              <div className="hidden md:flex items-center space-x-1">
                <Link to="#learn">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300">
                    Learn
                  </Button>
                </Link>
                <Link to="#docs">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300">
                    Docs
                  </Button>
                </Link>
                <Link to="#about">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300">
                    About Us
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0 rounded-lg hover:bg-muted/50 transition-all duration-300"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{getFullName(user.email)}</p>
                      <p className="w-[200px] truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
