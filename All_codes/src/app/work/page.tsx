'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DigitalTwinGraph } from '@/components/DigitalTwinGraph';
import { ScannerModal } from '@/components/ScannerModal';
import { RebookingModal } from '@/components/RebookingModal';
import { ARWayfinding } from '@/components/ARWayfinding';
import { WhisperAlert } from '@/components/WhisperAlert';
import { LiveFlightTracker } from '@/components/LiveFlightTracker';
import { BoardingPassIntel } from '@/components/BoardingPassIntel';
import { AIChatDrawer } from '@/components/AIChatDrawer';
import { TripStore, isDemo } from '@/lib/tripStore';
import { Leg, RebookingProposal, Trip } from '@/types';
import { simulateDisruptionApi } from '@/services/api';
import {
  AlertCircle,
  Camera,
  Compass,
  BookOpen,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Eye,
  FileText,
  Mic,
  Activity,
  Zap,
  GitBranch,
  BellRing,
  ArrowLeft,
  CheckCircle2,
  Navigation,
  MessageSquare,
  Bot,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type TabType = 'itinerary' | 'tracker' | 'pass' | 'disruption' | 'wayfinding' | 'tester';

import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function WorkPage() {
  const [legs, setLegs] = useState<Leg[]>([]);
  const [impactedLegIds, setImpactedLegIds] = useState<string[]>([]);
  const [proposal, setProposal] = useState<RebookingProposal | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);

  const who = currentUser ? { uid: currentUser.uid, email: currentUser.email } : null;
  const isDemoUser = isDemo(who);

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('itinerary');

  // Modals & Assistant States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isRebookingOpen, setIsRebookingOpen] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [whisperAlertMsg, setWhisperAlertMsg] = useState<string | null>(null);
  const [activeFeatureTest, setActiveFeatureTest] = useState<string | null>(null);

  const loadTripData = async (identity?: { uid: string; email?: string | null } | null) => {
    const [fetchedLegs, activeProp, fetchedTrip] = await Promise.all([
      TripStore.getLegs(identity),
      TripStore.getLatestProposal(identity),
      TripStore.getTrip(identity),
    ]);
    setLegs(fetchedLegs);
    setProposal(activeProp);
    setTrip(fetchedTrip);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      loadTripData(user ? { uid: user.uid, email: user.email } : null);
    });

    return () => unsubscribe();
  }, []);

  const handleSimulateDisruption = async () => {
    try {
      const data = await simulateDisruptionApi(who);

      if (data.success) {
        setImpactedLegIds(data.impactedLegIds || []);
        await loadTripData(who);

        setWhisperAlertMsg(
          data.proposalCreated
            ? `Flight ${data.flightNo || ''} disruption risk elevated to ${data.disruptionScore}/100. Consolidated rebooking proposal ready.`
            : `Flight ${data.flightNo || ''} disruption risk is now ${data.disruptionScore}/100 — still within acceptable range.`
        );

        if (data.proposalCreated) {
          setTimeout(() => {
            setIsRebookingOpen(true);
          }, 1200);
        }
      } else {
        setWhisperAlertMsg(data.message || 'No active flight leg to simulate a disruption for.');
      }
    } catch {
      setWhisperAlertMsg('Could not run the disruption simulation right now.');
    }
  };

  const handleScanSuccess = (newLeg: Leg) => {
    loadTripData(who);
    setWhisperAlertMsg(`New boarding pass added: ${newLeg.title}. Digital-Twin itinerary graph updated.`);
  };

  const handleApproveRebookingSuccess = (chosenFlightNo: string) => {
    loadTripData(who);
    setImpactedLegIds([]);
    setWhisperAlertMsg(`Rebooking executed! Replaced with flight ${chosenFlightNo}. Downstream legs updated.`);
  };

  const flightLeg = legs.find((l) => l.type === 'flight');
  const isDisrupted = flightLeg?.status === 'delayed' || impactedLegIds.length > 0;

  // 10 Core Features Tester Function
  const runFeatureTest = (featureId: number) => {
    switch (featureId) {
      case 1:
        setActiveFeatureTest('Multimodal AI Assistant');
        setIsAIChatOpen(true);
        break;
      case 2:
        setActiveFeatureTest('Document & Screen Intelligence');
        setIsScannerOpen(true);
        break;
      case 3:
        setActiveFeatureTest('Real-World Visual Understanding');
        setIsScannerOpen(true);
        break;
      case 4:
        setActiveFeatureTest('Natural Voice Interaction');
        setWhisperAlertMsg('Voice synthesized alert: Flight AI302 boarding in 12 minutes at Gate B22.');
        break;
      case 5:
        setActiveFeatureTest('Autonomous Travel Management');
        handleSimulateDisruption();
        break;
      case 6:
        setActiveFeatureTest('Context-Aware Navigation');
        setIsAROpen(true);
        break;
      case 7:
        setActiveFeatureTest('Real-Time Trip Monitoring');
        setActiveTab('tracker');
        break;
      case 8:
        setActiveFeatureTest('Event-Driven Automation');
        setWhisperAlertMsg('Automated Event Triggered: Weather hold detected at SFO. Standby flights calculated.');
        break;
      case 9:
        setActiveFeatureTest('Persistent Trip Context');
        setActiveTab('itinerary');
        break;
      case 10:
        setActiveFeatureTest('Smart Notifications & Recommendations');
        setWhisperAlertMsg('Smart Recommendation: High security rush at Terminal 3. Proceed to Gate B22 immediately.');
        break;
      default:
        break;
    }
  };

  const operationalFeatures = [
    { id: 1, name: 'Multimodal AI Assistant', icon: Eye, actionText: 'Open LLM Assistant' },
    { id: 2, name: 'Document & Screen Intelligence', icon: FileText, actionText: 'Scan Document' },
    { id: 3, name: 'Real-World Visual Understanding', icon: Camera, actionText: 'Open Camera Signage' },
    { id: 4, name: 'Natural Voice Interaction', icon: Mic, actionText: 'Speak Voice Alert' },
    { id: 5, name: 'Autonomous Travel Management', icon: ShieldAlert, actionText: 'Simulate Disruption' },
    { id: 6, name: 'Context-Aware Navigation', icon: Compass, actionText: 'Launch AR Compass' },
    { id: 7, name: 'Real-Time Trip Monitoring', icon: Activity, actionText: 'Open Radar Telemetry' },
    { id: 8, name: 'Event-Driven Automation', icon: Zap, actionText: 'Trigger Automation' },
    { id: 9, name: 'Persistent Trip Context', icon: GitBranch, actionText: 'Inspect Graph State' },
    { id: 10, name: 'Smart Notifications & Recommendations', icon: BellRing, actionText: 'Trigger Alert' },
  ];

  return (
    <div
      className={`min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 ${
        accessibilityMode ? 'text-lg font-bold' : ''
      }`}
    >
      {/* Header */}
      <Header
        tripStatus={isDisrupted ? 'disrupted' : 'onTime'}
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Whisper Voice Alert Banner */}
      {whisperAlertMsg && (
        <WhisperAlert
          message={whisperAlertMsg}
          voiceEnabled={accessibilityMode}
          onDismiss={() => setWhisperAlertMsg(null)}
        />
      )}

      {/* Navigation Top Bar */}
      <div className="max-w-6xl mx-auto px-4 pt-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-manrope font-semibold text-black dark:text-white hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AeroMind Homepage</span>
        </Link>

        <button
          onClick={() => setIsAIChatOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/20 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8 font-manrope">
        {/* Active Itinerary Overview Banner */}
        <div className="p-6 rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-semibold text-neutral-600 dark:text-neutral-300">
                {currentUser ? `Active Session: ${currentUser.email}` : 'Demo Workspace (Pre-loaded Itinerary)'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-black dark:text-white tracking-tight">
              {trip?.title || 'My Travel Itinerary'}
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              {flightLeg
                ? `Live Multimodal Telemetry Active · Flight ${flightLeg.flightNo || ''} (${flightLeg.title})`
                : 'No active flight leg yet — scan a boarding pass to activate live telemetry.'}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 dark:border-white/15 text-xs font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Scan or add your own custom flight / boarding pass"
            >
              <Camera className="w-4 h-4" />
              <span>Scan My Pass</span>
            </button>
            <button
              onClick={handleSimulateDisruption}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shadow-md hover:scale-105 transition-all"
              title="Simulate ATC delay and predictive disruption scoring"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Simulate Disruption</span>
            </button>

            <button
              onClick={() => setIsAROpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 dark:border-white/15 text-xs font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Launch 2D Compass Wayfinding Overlay"
            >
              <Compass className="w-4 h-4" />
              <span>AR Compass</span>
            </button>

            <Link
              to={`/journal/${trip?.id || 'trip_sfo_2026'}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-black/10 dark:border-white/15 text-xs font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Trip Journal</span>
            </Link>
          </div>
        </div>

        {/* Pending Rebooking Notification Banner */}
        {proposal && proposal.status === 'pending' && (
          <div className="p-4 rounded-2xl border border-black/20 dark:border-white/20 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-black dark:text-white flex-shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-black dark:text-white">
                  Consolidated Rebooking Proposal Ready
                </h4>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  {proposal.summary}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRebookingOpen(true)}
              className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold whitespace-nowrap shadow-md hover:scale-105 transition-transform"
            >
              Review & Approve
            </button>
          </div>
        )}

        {/* Tab Navigation System */}
        <div className="border-b border-black/10 dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'itinerary'
                ? 'border-black dark:border-white text-black dark:text-white bg-black/5 dark:bg-white/10'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Digital Twin Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'border-black dark:border-white text-black dark:text-white bg-black/5 dark:bg-white/10'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Live Flight Tracker & Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('pass')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pass'
                ? 'border-black dark:border-white text-black dark:text-white bg-black/5 dark:bg-white/10'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Boarding Pass Intel</span>
          </button>

          <button
            onClick={() => setActiveTab('disruption')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'disruption'
                ? 'border-black dark:border-white text-black dark:text-white bg-black/5 dark:bg-white/10'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Disruption Solver</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tester'
                ? 'border-black dark:border-white text-black dark:text-white bg-black/5 dark:bg-white/10'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>10 Features Tester</span>
          </button>
        </div>

        {/* Tab Content 1: Digital Twin Timeline */}
        {activeTab === 'itinerary' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white tracking-tight">
                  Stateful Digital-Twin Itinerary Graph
                </h2>
                <p className="text-xs text-neutral-500">
                  {legs.length > 0
                    ? 'Click any travel node (Flight ➔ Hotel ➔ Car) to inspect state dependencies.'
                    : 'Your active account is ready. Scan a boarding pass or add a flight to build your live graph.'}
                </p>
              </div>
              <button
                onClick={() => loadTripData(who)}
                className="flex items-center gap-1.5 text-xs font-medium text-black dark:text-white hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Graph</span>
              </button>
            </div>

            {legs.length === 0 ? (
              <div className="p-10 rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white flex items-center justify-center mx-auto text-xl">
                  <GitBranch className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold font-manrope text-black dark:text-white">
                    No Active Trips Found
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Your production account ({currentUser?.email || 'Logged In User'}) currently has no active flights. Scan a boarding pass or add a flight to initialize your real-time itinerary graph.
                  </p>
                </div>
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs shadow-md hover:scale-105 transition-all inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Your First Boarding Pass</span>
                </button>
              </div>
            ) : (
              <DigitalTwinGraph
                legs={legs}
                impactedLegIds={impactedLegIds}
                onSelectLeg={() => setIsRebookingOpen(true)}
              />
            )}
          </section>
        )}

        {/* Tab Content 2: Live Flight Tracker */}
        {activeTab === 'tracker' && (
          flightLeg?.flightNo || isDemoUser ? (
            <LiveFlightTracker
              flightNo={flightLeg?.flightNo || 'AI302'}
              onTriggerDisruption={handleSimulateDisruption}
            />
          ) : (
            <div className="p-10 rounded-2xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 text-center space-y-2">
              <h3 className="text-lg font-semibold text-black dark:text-white">No Active Flight to Track</h3>
              <p className="text-xs text-neutral-500">Scan a boarding pass to start live tracking.</p>
            </div>
          )
        )}

        {/* Tab Content 3: Boarding Pass Manifest Intel */}
        {activeTab === 'pass' && (
          <BoardingPassIntel
            legs={legs}
            isDemo={isDemoUser}
            onScanNewPass={() => setIsScannerOpen(true)}
          />
        )}

        {/* Tab Content 4: Disruption Solver */}
        {activeTab === 'disruption' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 space-y-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Predictive Disruption Engine & Rebooking Candidate Matrix
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                AeroMind computes continuous ATC disruption risk scores. When a delay threshold is breached (&gt; 60/100), candidate flight alternatives are generated and downstream hotel & car rental dates shift atomically.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleSimulateDisruption}
                  className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shadow-md hover:scale-105 transition-all"
                >
                  Trigger Live Delay Simulation{flightLeg?.flightNo ? ` (${flightLeg.flightNo})` : ''}
                </button>
                <button
                  onClick={() => setIsRebookingOpen(true)}
                  className="px-5 py-2.5 rounded-full border border-black/10 dark:border-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  Open Candidate Flight Matrix
                </button>
              </div>
            </div>

            <DigitalTwinGraph
              legs={legs}
              impactedLegIds={impactedLegIds}
              onSelectLeg={() => setIsRebookingOpen(true)}
            />
          </div>
        )}

        {/* Tab Content 5: 10 Features Tester */}
        {activeTab === 'tester' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-black dark:text-white" />
                  <h2 className="text-lg font-semibold text-black dark:text-white tracking-tight">
                    10 Core Features Live Interactive Suite
                  </h2>
                </div>
                <p className="text-xs text-neutral-500">
                  Click any feature below to execute its operational workflow in real time.
                </p>
              </div>

              {activeFeatureTest && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-xs font-semibold border border-black/10 dark:border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active Test: {activeFeatureTest}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {operationalFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 hover:border-black dark:hover:border-white shadow-sm flex flex-col justify-between space-y-3 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-neutral-500">
                          Feature #{feat.id}
                        </span>
                        <h3 className="text-xs font-semibold text-black dark:text-white leading-tight">
                          {feat.name}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => runFeatureTest(feat.id)}
                      className="w-full py-2 px-3 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{feat.actionText}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Persistent Floating AI LLM Assistant Button (Bottom-Right) */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-manrope font-semibold text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-2 border border-white/20 dark:border-black/20"
        title="Open AeroMind LLM AI Assistant Chat"
      >
        <Bot className="w-4 h-4" />
        <span>Ask AI Assistant</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* AI Chat Drawer */}
      <AIChatDrawer isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      {/* Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        who={who}
      />

      <RebookingModal
        isOpen={isRebookingOpen}
        proposal={proposal}
        onClose={() => setIsRebookingOpen(false)}
        onApproveSuccess={handleApproveRebookingSuccess}
        who={who}
      />

      <ARWayfinding
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
        targetGate={flightLeg?.details?.gate || (isDemoUser ? 'B22' : 'Not Assigned')}
        walkingEtaMinutes={8}
        minutesToBoarding={12}
      />
    </div>
  );
}
