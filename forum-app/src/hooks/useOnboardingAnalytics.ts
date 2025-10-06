import { useEffect } from 'react';

interface OnboardingEvent {
  event: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export function useOnboardingAnalytics() {
  const trackEvent = (eventName: string, metadata?: Record<string, any>) => {
    const event: OnboardingEvent = {
      event: eventName,
      timestamp: Date.now(),
      userId: localStorage.getItem('userId') || undefined,
      metadata,
    };

    // Store in localStorage for now (in production, send to analytics service)
    const existingEvents = JSON.parse(localStorage.getItem('onboarding_events') || '[]');
    existingEvents.push(event);
    localStorage.setItem('onboarding_events', JSON.stringify(existingEvents));

    // Log to console for debugging
    console.log('[Onboarding Analytics]', eventName, metadata);
  };

  const trackFunnelStep = (step: string, metadata?: Record<string, any>) => {
    const startTime = localStorage.getItem('onboarding_start_time');
    if (!startTime) {
      localStorage.setItem('onboarding_start_time', Date.now().toString());
    }

    const timeElapsed = startTime ? Date.now() - parseInt(startTime) : 0;

    trackEvent(`funnel:${step}`, {
      ...metadata,
      timeElapsed: Math.round(timeElapsed / 1000), // seconds
    });
  };

  const getFunnelMetrics = () => {
    const events = JSON.parse(localStorage.getItem('onboarding_events') || '[]');
    const startTime = localStorage.getItem('onboarding_start_time');

    if (!startTime) return null;

    const funnelSteps = events.filter((e: OnboardingEvent) => e.event.startsWith('funnel:'));
    const totalTime = Date.now() - parseInt(startTime);

    return {
      totalTime: Math.round(totalTime / 1000),
      steps: funnelSteps,
      completionRate: funnelSteps.length > 0 ? 1 : 0,
    };
  };

  return {
    trackEvent,
    trackFunnelStep,
    getFunnelMetrics,
  };
}

// Onboarding funnel steps to track:
export const ONBOARDING_EVENTS = {
  // Landing page
  LANDING_VIEW: 'landing:view',
  LANDING_SIGN_IN_CLICK: 'landing:sign_in_click',

  // Authentication
  AUTH_GOOGLE_START: 'auth:google_start',
  AUTH_GOOGLE_SUCCESS: 'auth:google_success',
  AUTH_GOOGLE_FAILURE: 'auth:google_failure',
  AUTH_EMAIL_START: 'auth:email_start',
  AUTH_EMAIL_SUCCESS: 'auth:email_success',
  AUTH_EMAIL_FAILURE: 'auth:email_failure',

  // Username setup
  USERNAME_VIEW: 'funnel:username_view',
  USERNAME_SUGGESTION_SHOWN: 'username:suggestion_shown',
  USERNAME_SUGGESTION_ACCEPTED: 'username:suggestion_accepted',
  USERNAME_MANUAL_ENTRY: 'username:manual_entry',
  USERNAME_RANDOMIZE_CLICK: 'username:randomize_click',
  USERNAME_CHECK_AVAILABILITY: 'username:check_availability',
  USERNAME_AVAILABLE: 'username:available',
  USERNAME_TAKEN: 'username:taken',
  USERNAME_SUBMIT_SUCCESS: 'funnel:username_created',
  USERNAME_SUBMIT_FAILURE: 'username:submit_failure',

  // Celebration
  CELEBRATION_VIEW: 'celebration:view',
  CELEBRATION_COPY_LINK: 'celebration:copy_link',
  CELEBRATION_DISMISS: 'celebration:dismiss',

  // Welcome onboarding
  WELCOME_VIEW: 'funnel:welcome_tour_start',
  WELCOME_STEP_VIEW: 'welcome:step_view',
  WELCOME_SKIP: 'welcome:skip',
  WELCOME_COMPLETE: 'funnel:welcome_tour_complete',

  // First actions
  FIRST_FORUM_VIEW: 'funnel:first_forum_view',
  FIRST_THREAD_CREATE: 'funnel:first_thread_create',
  FIRST_MESSAGE_SEND: 'funnel:first_message_send',

  // Dropoff points
  DROPOFF_USERNAME: 'dropoff:username',
  DROPOFF_WELCOME: 'dropoff:welcome',
};

// Calculate funnel conversion rates
export function calculateFunnelMetrics(events: OnboardingEvent[]) {
  const stepCounts: Record<string, number> = {};

  events.forEach((event) => {
    if (event.event.startsWith('funnel:')) {
      stepCounts[event.event] = (stepCounts[event.event] || 0) + 1;
    }
  });

  const funnelSteps = [
    'funnel:username_view',
    'funnel:username_created',
    'funnel:welcome_tour_start',
    'funnel:welcome_tour_complete',
    'funnel:first_forum_view',
  ];

  const conversions: Record<string, number> = {};
  for (let i = 1; i < funnelSteps.length; i++) {
    const previousStep = funnelSteps[i - 1];
    const currentStep = funnelSteps[i];

    const previousCount = stepCounts[previousStep] || 0;
    const currentCount = stepCounts[currentStep] || 0;

    if (previousCount > 0) {
      conversions[currentStep] = (currentCount / previousCount) * 100;
    }
  }

  return {
    stepCounts,
    conversions,
    totalUsers: stepCounts['funnel:username_view'] || 0,
  };
}

// Time-to-value metrics
export function calculateTimeToValue(events: OnboardingEvent[]) {
  const usernameView = events.find((e) => e.event === 'funnel:username_view');
  const usernameCreated = events.find((e) => e.event === 'funnel:username_created');
  const welcomeComplete = events.find((e) => e.event === 'funnel:welcome_tour_complete');
  const firstAction = events.find((e) =>
    ['funnel:first_thread_create', 'funnel:first_message_send'].includes(e.event)
  );

  const metrics: Record<string, number | null> = {
    usernameSetupTime: null,
    onboardingTime: null,
    timeToFirstAction: null,
  };

  if (usernameView && usernameCreated) {
    metrics.usernameSetupTime = Math.round((usernameCreated.timestamp - usernameView.timestamp) / 1000);
  }

  if (usernameView && welcomeComplete) {
    metrics.onboardingTime = Math.round((welcomeComplete.timestamp - usernameView.timestamp) / 1000);
  }

  if (usernameView && firstAction) {
    metrics.timeToFirstAction = Math.round((firstAction.timestamp - usernameView.timestamp) / 1000);
  }

  return metrics;
}
