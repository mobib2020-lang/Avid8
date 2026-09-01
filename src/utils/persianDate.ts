import { useState, useEffect } from 'react';

/**
 * Utility functions for dynamic Persian (Jalali) date and time formatting
 * Automatically calculates the accurate Jalali date dynamically for every day.
 */

/**
 * Returns formatted Persian date for today (or passed date)
 * e.g., "امروز شنبه، ۱ شهریور ۱۴۰۵"
 */
export function getTodayPersianDateString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      calendar: 'persian',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `امروز ${formatter.format(date)}`;
  } catch {
    try {
      const fallbackFormatter = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return `امروز ${fallbackFormatter.format(date)}`;
    } catch {
      return 'امروز';
    }
  }
}

/**
 * Returns clean formatted Persian date without "امروز"
 * e.g., "شنبه، ۱ شهریور ۱۴۰۵"
 */
export function getPersianDateFullString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      calendar: 'persian',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    try {
      const fallbackFormatter = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return fallbackFormatter.format(date);
    } catch {
      return '';
    }
  }
}

/**
 * Returns short Persian date format
 * e.g., "۱۴۰۵/۰۶/۰۱"
 */
export function getPersianDateShortString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      calendar: 'persian',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    try {
      const fallback = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return fallback.format(date);
    } catch {
      return '';
    }
  }
}

/**
 * React hook that provides live Persian date string for today,
 * updating automatically if the day changes or every minute.
 */
export function useLivePersianDate(): string {
  const [persianDate, setPersianDate] = useState(() => getTodayPersianDateString());

  useEffect(() => {
    setPersianDate(getTodayPersianDateString());
    const interval = setInterval(() => {
      setPersianDate(getTodayPersianDateString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return persianDate;
}
