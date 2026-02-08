import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Tag,
  MapPin,
  Train,
  Filter,
  Handshake,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShoppingCategory, DealBuddyRequest } from '@/types/itinerary';
import { SHOPPING_DEALS, SHOPPING_CATEGORIES, DEMO_BUDDY_REQUESTS } from '@/data/shoppingDeals';

const DEAL_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  bogo: { label: 'Buy 1 Get 1', color: 'bg-travel-green-light text-travel-green' },
  discount: { label: 'Discount', color: 'bg-travel-amber-light text-travel-amber' },
  combo: { label: 'Combo Deal', color: 'bg-travel-teal-light text-travel-teal' },
  seasonal: { label: 'Seasonal Sale', color: 'bg-secondary text-secondary-foreground' },
};

function timeAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function ShoppingSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory | 'all'>('all');
  const [buddyModalOpen, setBuddyModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [buddyName, setBuddyName] = useState('');
  const [buddyItem, setBuddyItem] = useState('');
  const [buddyRequests, setBuddyRequests] = useState<DealBuddyRequest[]>(DEMO_BUDDY_REQUESTS);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const filteredDeals = useMemo(() => {
    if (selectedCategory === 'all') return SHOPPING_DEALS;
    return SHOPPING_DEALS.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  const bogoDeals = useMemo(() => SHOPPING_DEALS.filter((d) => d.dealType === 'bogo'), []);

  const handleCreateBuddyRequest = () => {
    if (!buddyName.trim() || !buddyItem.trim() || !selectedDealId) return;
    const newReq: DealBuddyRequest = {
      id: `buddy-${Date.now()}`,
      dealId: selectedDealId,
      userName: buddyName,
      itemWanted: buddyItem,
      lookingForPartner: true,
      createdAt: new Date(),
    };
    setBuddyRequests((prev) => [newReq, ...prev]);
    setBuddyName('');
    setBuddyItem('');
    setBuddyModalOpen(false);
    setJoinSuccess(null);
  };

  const handleJoinBuddy = (buddyId: string) => {
    setBuddyRequests((prev) =>
      prev.map((r) => (r.id === buddyId ? { ...r, lookingForPartner: false } : r))
    );
    setJoinSuccess(buddyId);
    setTimeout(() => setJoinSuccess(null), 3000);
  };

  const selectedDeal = selectedDealId ? SHOPPING_DEALS.find((d) => d.id === selectedDealId) : null;
  const dealBuddies = selectedDealId
    ? buddyRequests.filter((r) => r.dealId === selectedDealId)
    : [];

  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ShoppingBag className="w-4 h-4 text-primary" />
          Shopping & Deals in Delhi
          <Badge variant="secondary" className="text-[10px] ml-1">
            {SHOPPING_DEALS.length} deals
          </Badge>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t pt-4 space-y-4">
              {/* Demo data notice */}
              <div className="flex items-start gap-2 bg-travel-amber-light/50 border border-travel-amber/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 text-travel-amber shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Demo Data:</span> All shop names, prices, and deals shown here are simulated for demonstration. Actual deals may vary. Names like "Rajesh Fashion House" or "Meena Boutique" are fictional.
                </p>
              </div>

              {/* Category filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Filter className="w-3.5 h-3.5" />
                  What are you shopping for?
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    All
                  </button>
                  {SHOPPING_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedCategory === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deals list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                    onClick={() => {
                      setSelectedDealId(deal.id);
                      if (deal.dealType === 'bogo') setBuddyModalOpen(true);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${DEAL_TYPE_LABELS[deal.dealType].color}`}>
                              <Tag className="w-2.5 h-2.5" />
                              {DEAL_TYPE_LABELS[deal.dealType].label}
                            </span>
                            {deal.dealType === 'bogo' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-primary">
                                <Handshake className="w-2.5 h-2.5" />
                                Find a Buddy
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-foreground leading-tight">
                            {deal.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">{deal.shopName}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> {deal.area}
                            </span>
                            {deal.metroNearby && (
                              <span className="flex items-center gap-0.5">
                                <Train className="w-2.5 h-2.5" /> Metro nearby
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs line-through text-muted-foreground">
                            ₹{deal.originalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            ₹{deal.dealPrice.toLocaleString()}
                          </p>
                          {deal.dealType === 'bogo' && (
                            <p className="text-[9px] text-muted-foreground mt-0.5">for 2 items</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Deal Buddy section for BOGO */}
              {bogoDeals.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Handshake className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Deal Buddy — Team Up & Save</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Want only 1 item from a Buy-1-Get-1 deal? Find someone who wants the other item and split the cost!
                  </p>

                  {/* Active buddy requests */}
                  <div className="space-y-1.5">
                    {buddyRequests
                      .filter((r) => r.lookingForPartner)
                      .slice(0, 5)
                      .map((req) => {
                        const deal = SHOPPING_DEALS.find((d) => d.id === req.dealId);
                        if (!deal) return null;
                        return (
                          <div
                            key={req.id}
                            className="flex items-center justify-between bg-muted/50 rounded-lg p-2.5 border"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">
                                {req.userName} wants: <span className="text-primary">{req.itemWanted}</span>
                              </p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Tag className="w-2.5 h-2.5" /> {deal.title}
                                <span>·</span>
                                <Clock className="w-2.5 h-2.5" /> {timeAgo(req.createdAt)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] gap-1 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinBuddy(req.id);
                              }}
                            >
                              <Users className="w-3 h-3" />
                              Team Up
                            </Button>
                          </div>
                        );
                      })}
                  </div>

                  {joinSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-travel-green-light border border-travel-green/20 rounded-lg p-2.5"
                    >
                      <p className="text-xs text-travel-green font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        You've teamed up! Coordinate with your buddy to grab the deal together.
                      </p>
                    </motion.div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => {
                      setSelectedDealId(bogoDeals[0].id);
                      setBuddyModalOpen(true);
                    }}
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    Post Your Own Buddy Request
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buddy Modal */}
      <Dialog open={buddyModalOpen} onOpenChange={setBuddyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Handshake className="w-5 h-5 text-primary" />
              Deal Buddy — Find a Partner
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedDeal
                ? `${selectedDeal.title} at ${selectedDeal.shopName}`
                : 'Team up with someone for a BOGO deal'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Existing buddies for this deal */}
            {dealBuddies.filter((r) => r.lookingForPartner).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Looking for a partner
                </h4>
                {dealBuddies
                  .filter((r) => r.lookingForPartner)
                  .map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-muted/50 rounded-lg p-3 border"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{req.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          Wants: {req.itemWanted} · {timeAgo(req.createdAt)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => handleJoinBuddy(req.id)}
                      >
                        <Users className="w-3.5 h-3.5" />
                        Team Up
                      </Button>
                    </div>
                  ))}
              </div>
            )}

            {/* Create new request */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Or post your own request
              </h4>
              <Input
                placeholder="Your name"
                value={buddyName}
                onChange={(e) => setBuddyName(e.target.value)}
                className="h-9 text-sm"
              />
              <Input
                placeholder="What item do you want? (e.g., Blue jacket, size M)"
                value={buddyItem}
                onChange={(e) => setBuddyItem(e.target.value)}
                className="h-9 text-sm"
              />

              {/* Deal selector if none selected */}
              {!selectedDealId && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Select a BOGO deal:</p>
                  {bogoDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                        selectedDealId === deal.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      {deal.title} — {deal.shopName}
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={handleCreateBuddyRequest}
                disabled={!buddyName.trim() || !buddyItem.trim()}
                className="w-full gap-1.5"
                size="sm"
              >
                <Handshake className="w-4 h-4" />
                Post Buddy Request
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              This is a demo feature with simulated data. In production, this would connect with real users.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
