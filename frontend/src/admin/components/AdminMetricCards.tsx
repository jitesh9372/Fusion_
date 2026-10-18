import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItemFadeUp } from '@/animations/motionConfig';
import {
  Users,
  Wrench,
  Briefcase,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import type { AdminAnalyticsData } from '@/types/marketplace';

interface AdminMetricCardsProps {
  analytics: AdminAnalyticsData | null;
}

export const AdminMetricCards: React.FC<AdminMetricCardsProps> = ({ analytics }) => {
  const cards = [
    {
      title: 'Total Cooperative Members',
      value:
        analytics?.totalUsers != null
          ? analytics.totalUsers.toLocaleString()
          : (analytics?.totalCustomers != null && analytics?.totalWorkers != null)
          ? (analytics.totalCustomers + analytics.totalWorkers).toLocaleString()
          : analytics?.totalCustomers != null
          ? analytics.totalCustomers.toLocaleString()
          : '0',
      sub: 'Verified Customer & Worker Accounts',
      icon: Users,
      color: 'text-[#14524C]',
    },
    {
      title: 'Certified Artisans',
      value:
        analytics?.verifiedWorkers != null
          ? analytics.verifiedWorkers.toLocaleString()
          : analytics?.activeWorkers != null
          ? analytics.activeWorkers.toLocaleString()
          : analytics?.totalWorkers != null
          ? analytics.totalWorkers.toLocaleString()
          : '0',
      sub: 'Background-Checked Specialists',
      icon: Wrench,
      color: 'text-[#4A6741]',
    },
    {
      title: 'Total System Bookings',
      value:
        analytics?.totalBookings != null
          ? analytics.totalBookings.toLocaleString()
          : analytics?.activeBookings != null
          ? (analytics.activeBookings + (analytics.completedBookings || 0)).toLocaleString()
          : '0',
      sub: 'Active & Completed Executions',
      icon: Briefcase,
      color: 'text-[#D68C31]',
    },
    {
      title: 'Gross Volume (GMV)',
      value:
        analytics?.grossMarketplaceVolume != null
          ? `₹${analytics.grossMarketplaceVolume.toLocaleString()}`
          : analytics?.platformRevenue != null
          ? `₹${analytics.platformRevenue.toLocaleString()}`
          : '₹0',
      sub: '100% Cooperative Transaction Value',
      icon: TrendingUp,
      color: 'text-[#9C4A34]',
    },
    {
      title: 'Escrow Protected Funds',
      value:
        analytics?.escrowBalance != null
          ? `₹${analytics.escrowBalance.toLocaleString()}`
          : analytics?.platformRevenue != null
          ? `₹${analytics.platformRevenue.toLocaleString()}`
          : '₹0',
      sub: 'Guaranteed Buyer/Worker Safety',
      icon: CreditCard,
      color: 'text-[#14524C]',
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            variants={staggerItemFadeUp}
            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)' }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="p-6 rounded-3xl border border-[#D8D3C7] bg-[#FFFFFF] shadow-sm flex flex-col justify-between space-y-4 cursor-default transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A423E]/70">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-2xl bg-[#EEF1EE] ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#1B2420]">{card.value}</p>
              <span className="text-[10px] text-[#3A423E]/70 block mt-1">{card.sub}</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};


export default AdminMetricCards;
