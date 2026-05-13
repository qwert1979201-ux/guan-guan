import React, { useState, useEffect, Component } from 'react';
import { 
  Cloud, 
  Cpu, 
  Database, 
  Layers, 
  Zap, 
  Brain, 
  TrendingUp, 
  Image as ImageIcon, 
  Activity,
  Users,
  Terminal,
  Settings,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Monitor,
  HardDrive,
  Network,
  Share2,
  Lock,
  Globe,
  Play,
  Server,
  Shield,
  Maximize,
  ShieldAlert,
  AlertCircle,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { cn } from './lib/utils';

// --- Mock Data (Intelligence Focus) ---
const mockTelemetry = [
  { module: 'Ollama-Qwen', metric: 'Token/s', value: 42.5, status: 'completed' },
  { module: 'SDXL-V1.0', metric: 'Lat (ms)', value: 840, status: 'busy' },
  { module: 'Qdrant Core', metric: 'Mem (MB)', value: 1240, status: 'completed' },
  { module: 'PostgreSQL', metric: 'Conn', value: 12, status: 'completed' },
  { module: 'GPU-Node-01', metric: 'Uti (%)', value: 78, status: 'completed' },
  { module: 'Queue Backlog', metric: 'Count', value: 4, status: 'processing' },
];

const mockTrendMap = [
  { city: 'Paris', heat: 92, trend: '极简奢华' },
  { city: 'Seoul', heat: 88, trend: '高科技街头' },
  { city: 'New York', heat: 75, trend: '新古典主义' },
  { city: 'Tokyo', heat: 82, trend: '赛博流行' },
  { city: 'Milan', heat: 79, trend: '科技褶皱' },
];

const mockMemoryClusters = [
  { x: 10, y: 30, z: 200, style: '赛博朋克', count: 124 },
  { x: 45, y: 70, z: 150, style: '极简主义', count: 89 },
  { x: 80, y: 20, z: 180, style: '先锋派', count: 67 },
  { x: 30, y: 50, z: 250, style: '街头服饰', count: 210 },
  { x: 60, y: 40, z: 100, style: '复古风', count: 45 },
];

const mockBrandHeat = [
  { name: 'Balenciaga', value: 400, color: '#10b981' },
  { name: 'Rick Owens', value: 300, color: '#3b82f6' },
  { name: 'Acne Studios', value: 300, color: '#f59e0b' },
  { name: 'Diesel', value: 200, color: '#ef4444' },
];

const mockTrends = [
  { name: 'Iridescent Silk', score: 85, velocity: 1.8, category: 'Material' },
  { name: 'Oversized Puffer', score: 92, velocity: 0.5, category: 'Silhouette' },
  { name: 'Matte Chrome', score: 78, velocity: 2.4, category: 'Finish' },
  { name: 'Deconstructed', score: 65, velocity: 1.2, category: 'Style' },
];

// --- Components ---

class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('UI Crash Caught:', error, errorInfo);
  }
  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div className="p-12 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
          <AlertCircle className="mx-auto mb-4 text-rose-500" size={32} />
          <h3 className="text-xl font-black uppercase italic italic">Neural Infrastructure Breach</h3>
          <p className="text-zinc-500 text-sm mt-2">发生渲染异常任务。正在重新校准系统状态...</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-emerald-500 text-black text-[10px] font-bold uppercase rounded-full"
          >
            重启 OS 系统
          </button>
        </div>
      );
    }
    return (this.props as any).children;
  }
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg",
      active 
        ? "bg-zinc-800 text-white shadow-lg shadow-zinc-950/20" 
        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
    )}
  >
    <Icon size={18} className={active ? "text-emerald-400" : ""} />
    <span>{label}</span>
  </button>
);

const Card = ({ children, title, className, icon: Icon }: { children: React.ReactNode, title?: string, className?: string, icon?: any }) => (
  <div className={cn("bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-hidden flex flex-col transition-all", className)}>
    {title && (
      <div className="flex items-center gap-2 mb-6 shrink-0">
        {Icon && <Icon size={16} className="text-zinc-400" />}
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{title}</h3>
      </div>
    )}
    <div className="flex-1 w-full relative">
      {children}
    </div>
  </div>
);

  const ChartPanel = ({ children, height = 350 }: { children: React.ReactNode, height?: number }) => (
    <div 
      className="relative w-full overflow-hidden" 
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    >
      {children}
    </div>
  );

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    busy: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    offline: "bg-zinc-800 text-zinc-500 border-zinc-700",
  };
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      styles[status as keyof typeof styles] || styles.offline
    )}>
      {status}
    </span>
  );
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'intelligence' | 'memory' | 'curator' | 'runtime' | 'graph' | 'data' | 'generations' | 'workers' | 'registry' | 'auth'>('dashboard');
  const [scrolled, setScrolled] = useState(false);
  const [language, setLanguage] = useState<'en' | 'cn'>('cn'); // Default to Chinese as requested

  const i18n = {
    en: {
      sidebar: {
        core: "Core OS",
        intelligence: "Intelligence Center",
        trends: "Trend Matrix",
        memory: "Memory Clusters",
        data: "Data Operations",
        graph: "Knowledge Graph",
        runtime: "Runtime",
        generations: "Generations",
        compute: "Compute Nodes",
        infra: "Infrastructure",
        registry: "System Registry",
        auth: "Auth & Security",
        status: "System Ready"
      },
      dashboard: {
        velocity: "Trend Velocity",
        velocityDesc: "SYSTEM TRACKING 24 HOT SILHOUETTES",
        memory: "Memory Capacity",
        memoryDesc: "QDRANT INSTANCE IS 42% FULL",
        inference: "Inference Load",
        inferenceDesc: "LATEST MODEL: FLUX MODE-II (INT8)",
        projection: "Neural Style Projection (Qdrant Space)",
        telemetry: "Runtime Telemetry",
        velocityMap: "Global Trend Velocity Map",
        recognition: "Brand Recognition Momentum",
        heatIndex: "Global Heat Index",
        feed: "Intelligence Generation Feed",
        recalibrating: "Recalibrating Runtime Metrics...",
        brandMatch: "Match",
        detected: "Detected 4h ago",
        high: "HIGH",
        score: "Score"
      },
      intelligence: {
        title: "Fashion Semantic Intelligence",
        desc: "Autonomous reasoning across Brand DNA, Dataset Logic, and Style Relationships.",
        recalibrate: "Recalibrate Embeddings",
        update: "Update Fashion Brain",
        brandDna: "Structural Brand DNA (European Core)",
        datasetScore: "Dataset Intelligence Score",
        qualityIndex: "Quality Index",
        totalAssets: "TOTAL ASSETS ANALYZED",
        reasoning: "Autonomous Agent Reasoning Logs",
        outfitLogic: "Autonomous Outfit Logic",
        agentLogs: "Agent Intelligence Logs",
        analysisMatch: "Match",
        polling: "Polling reasoning streams from OS core...",
        calculating: "Calculating compatibility..."
      },
      data: {
        title: "Intelligence Ingestion Pipeline",
        desc: "Headless stealth crawlers restoring high-definition fashion semantics.",
        stealth: "Stealth Mode Active",
        startCrawl: "Start Global Crawl",
        crawlers: "Headless Crawler Agents",
        nodes: "Ingestion Nodes",
        proxyHealth: "Global Proxy Health",
        restoration: "HD Restoration Logic",
        ingestionLogs: "Neural Ingestion Logs",
        audits: "AI Dataset Quality Audits (Rejection Reports)",
        uptime: "UPTIME",
        rejected: "REJECTED",
        source: "Source",
        tier: "Tier",
        status: "Status",
        threshold: "Threshold",
        action: "Action"
      },
      graph: {
        title: "Fashion Relational Consciousness",
        desc: "Visualizing the semantic links between Brands, Styles, and Global Trends.",
        rebuild: "Rebuild Graph Index",
        neo4j: "Neural Knowledge Graph (Neo4j Sync)",
        interactive: "Interactive Mode Active",
        affinities: "Strongest Affinities",
        anomalies: "Anomalous Links",
        vitality: "Schema Vitality",
        nodes: "NODE COUNT",
        edges: "EDGE COUNT",
        density: "DENSITY"
      },
      placeholder: {
        initializing: "Module Initializing",
        desc: "The intelligence infrastructure is currently indexing local embeddings and synchronizing with the Knowledge Graph. Verify your local runtime instance.",
        trace: "Direct SQL Trace",
        return: "System Return"
      },
      common: {
        search: "Neural Style Search...",
        runEngine: "Run Intelligence",
        investigate: "Investigate Link",
        source: "Source",
        tier: "Tier",
        status: "Status",
        threshold: "Threshold",
        action: "Action",
        system: "System"
      },
      metrics: {
        match: "Match",
        analysis: "Analysis",
        score: "Score"
      }
    },
    cn: {
      sidebar: {
        core: "核心系统",
        intelligence: "智能中心",
        trends: "趋势矩阵",
        memory: "审美记忆集群",
        data: "数据操作",
        graph: "知识图谱",
        runtime: "运行时",
        generations: "实时生成",
        compute: "计算节点",
        infra: "基础设施",
        registry: "系统注册表",
        auth: "权限与安全",
        status: "系统就绪"
      },
      dashboard: {
        velocity: "趋势速率",
        velocityDesc: "系统正在追踪 24 种热门廓形",
        memory: "语义记忆容量",
        memoryDesc: "QDRANT 向量实例已占用 42%",
        inference: "推理负载 (延迟)",
        inferenceDesc: "当前模型: FLUX MODE-II (INT8)",
        projection: "神经风格投影 (Qdrant 向量空间)",
        telemetry: "运行时遥测感应",
        velocityMap: "全球趋势速率分布图",
        recognition: "品牌辨识度动能",
        heatIndex: "全球热度指数",
        feed: "智能生成信息流",
        recalibrating: "正在重新校准运行时指标...",
        brandMatch: "匹配度",
        detected: "4小时前检测到",
        high: "极高",
        score: "评分"
      },
      intelligence: {
        title: "时尚语义智能引擎",
        desc: "跨品牌 DNA、数据集逻辑和风格关系的自主推理系统。",
        recalibrate: "重新校准嵌入向量",
        update: "更新时尚大脑",
        brandDna: "结构化品牌基因 (欧洲核心库)",
        datasetScore: "数据集智能评分",
        qualityIndex: "质量指数",
        totalAssets: "已分析总资产量",
        reasoning: "自主代理推理日志",
        outfitLogic: "自主穿搭逻辑引擎",
        agentLogs: "代理智能操作日志",
        analysisMatch: "匹配分析",
        polling: "正在从系统核心轮询推理流...",
        calculating: "正在计算兼容性..."
      },
      data: {
        title: "智能数据摄取管道",
        desc: "使用无头隐形爬虫恢复高清晰度的时尚语义信息。",
        stealth: "隐私模式已激活",
        startCrawl: "开启全球数据采集",
        crawlers: "无头爬虫代理集群",
        nodes: "摄取节点状态",
        proxyHealth: "全球代理池健康度",
        restoration: "高清修复逻辑",
        ingestionLogs: "神经摄取日志",
        audits: "AI 数据集质量审计 (拒绝报告)",
        uptime: "在线时间",
        rejected: "已拒绝",
        source: "数据源",
        tier: "层级",
        status: "状态",
        threshold: "阈值质量",
        action: "操作"
      },
      graph: {
        title: "时尚关系意识网络",
        desc: "可视化品牌、风格与全球趋势之间的语义关联。",
        rebuild: "重建图谱索引",
        neo4j: "神经知识图谱 (Neo4j 同步)",
        interactive: "交互模式已激活",
        affinities: "强关联分析",
        anomalies: "异常链接检测",
        vitality: "模式活力指标",
        nodes: "节点总数",
        edges: "边总数",
        density: "图谱密度"
      },
      placeholder: {
        initializing: "模块初始化中",
        desc: "智能基础设施当前正在索引本地嵌入向量并与知识图谱同步。请验证您的本地运行时实例。",
        trace: "直接 SQL 追踪",
        return: "返回系统"
      },
      common: {
        search: "神经风格搜索...",
        runEngine: "运行智能引擎",
        investigate: "调查关联性",
        source: "数据源",
        tier: "层级",
        status: "状态",
        threshold: "阈值",
        action: "操作",
        system: "系统"
      },
      metrics: {
        match: "匹配度",
        analysis: "分析指标",
        score: "评分"
      }
    }
  };

  const t = i18n[language];
  const [crawlers, setCrawlers] = useState<any[]>([]);
  const [proxies, setProxies] = useState<any[]>([]);
  const [hydrationRules, setHydrationRules] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // --- Fashion Brain Intelligence State ---
  const [metrics, setMetrics] = useState<any[]>(mockTelemetry);
  const [brandDna, setBrandDna] = useState<any[]>([]);
  const [datasetQuality, setDatasetQuality] = useState<any>(null);
  const [outfitLogic, setOutfitLogic] = useState<any[]>([]);
  const [agentLogic, setAgentLogic] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const safeSet = (setter: (data: any) => void, defaultVal: any = []) => (data: any) => {
      if (Array.isArray(data)) {
        setter(data);
      } else {
        console.warn('API data invalid, using default:', typeof data);
        setter(defaultVal);
      }
    };

    // Extreme Sanitize Metrics
    const normalizeMetrics = (data: any[]) => {
      if (!Array.isArray(data)) return mockTelemetry;
      return data.map(item => ({
        module: String(item?.module || item?.module_name || 'System'),
        metric: String(item?.metric || item?.metric_key || 'Usage'),
        value: Number.isFinite(Number(item?.value)) ? Number(item.value) : (Number.isFinite(Number(item?.metric_value)) ? Number(item.metric_value) : 0),
        status: String(item?.status || 'active')
      }));
    };

    fetch('/api/runtime/metrics')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMetrics(data.length > 0 ? normalizeMetrics(data) : mockTelemetry);
        } else {
          setMetrics(mockTelemetry);
        }
      })
      .catch(() => setMetrics(mockTelemetry));

    fetch('/api/intelligence/brand-dna')
      .then(res => res.json())
      .then(data => {
        if (data && data.error) {
          setBrandDna([]);
        } else {
          safeSet(setBrandDna)(data);
        }
      })
      .catch(() => setBrandDna([]));

    fetch('/api/intelligence/dataset-quality')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setDatasetQuality({
            ...data,
            avg_aesthetic: Number(data.avg_aesthetic || 0),
            avg_density: Number(data.avg_density || 0),
            avg_luxury: Number(data.avg_luxury || 0),
            avg_runway: Number(data.avg_runway || 0),
            avg_editorial: Number(data.avg_editorial || 0),
            avg_silhouette: Number(data.avg_silhouette || 0),
            total_assets: Number(data.total_assets || 0),
            audits: data.audits || {}
          });
        }
      })
      .catch(err => console.error('Quality Intel Fetch Failure:', err));

    fetch('/api/intelligence/agent-logic')
      .then(res => res.json())
      .then(safeSet(setAgentLogic))
      .catch(() => setAgentLogic([]));

    fetch('/api/intelligence/outfit-logic')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOutfitLogic(data.map((d: any) => ({
            ...d,
            compatibility_score: Number(d.compatibility_score || 0)
          })));
        }
      })
      .catch(() => setOutfitLogic([]));

    fetch('/api/dataset/crawlers').then(res => res.json()).then(safeSet(setCrawlers)).catch(() => setCrawlers([]));
    fetch('/api/dataset/proxies').then(res => res.json()).then(safeSet(setProxies)).catch(() => setProxies([]));
    fetch('/api/dataset/hydration-rules').then(res => res.json()).then(safeSet(setHydrationRules)).catch(() => setHydrationRules([]));
    fetch('/api/dataset/quality-audits').then(res => res.json()).then(safeSet(setAuditLogs)).catch(() => setAuditLogs([]));
  }, []);

  // --- Helpers ---
  const normalizeArray = (data: any) => Array.isArray(data) ? data : [];
  
  const safeNumber = (val: any, fallback = 0): number => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const safeScatterData = (data: any[]) => {
    return normalizeArray(data)
      .filter(d => d && typeof d === 'object')
      .map(d => ({
        ...d,
        x: safeNumber(d.x),
        y: safeNumber(d.y),
        z: safeNumber(d.z, 200)
      }))
      .filter(d => Number.isFinite(d.x) && Number.isFinite(d.y));
  };

  const safePieData = (data: any[]) => {
    return normalizeArray(data)
      .filter(d => d && typeof d === 'object' && d.name)
      .map(d => ({
        ...d,
        value: safeNumber(d.value)
      }))
      .filter(d => d.value > 0);
  };

  const SafeScatterPoint = (props: any) => {
    const { cx, cy, fill } = props;
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
    return <circle cx={cx} cy={cy} r={6} fill={fill} fillOpacity={0.6} stroke="none" />;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">Hydrating Fashion OS Infrastructure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800/50 bg-black/50 backdrop-blur-xl z-50 p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-12 px-2">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
            <Network className="text-black" size={20} />
          </div>
          <span className="font-bold tracking-tight text-xl">Fashion Brain</span>
        </div>

        <div className="space-y-1 mb-8">
          <p className="text-[10px] font-bold uppercase text-zinc-600 px-4 mb-2 tracking-[0.2em]">{t.sidebar.core}</p>
          <SidebarItem icon={Activity} label={t.sidebar.intelligence} active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} />
          <SidebarItem icon={TrendingUp} label={t.sidebar.trends} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Brain} label={t.sidebar.memory} active={activeTab === 'memory'} onClick={() => setActiveTab('memory')} />
          <SidebarItem icon={Database} label={t.sidebar.data} active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
          <SidebarItem icon={Share2} label={t.sidebar.graph} active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} />
        </div>

        <div className="space-y-1 mb-8">
          <p className="text-[10px] font-bold uppercase text-zinc-600 px-4 mb-2 tracking-[0.2em]">{t.sidebar.runtime}</p>
          <SidebarItem icon={Zap} label={t.sidebar.generations} active={activeTab === 'generations'} onClick={() => setActiveTab('generations')} />
          <SidebarItem icon={Cpu} label={t.sidebar.compute} active={activeTab === 'workers'} onClick={() => setActiveTab('workers')} />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-zinc-600 px-4 mb-2 tracking-[0.2em]">{t.sidebar.infra}</p>
          <SidebarItem icon={Database} label={t.sidebar.registry} active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} />
          <SidebarItem icon={Lock} label={t.sidebar.auth} active={activeTab === 'auth'} onClick={() => setActiveTab('auth')} />
        </div>

        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center">
              <Globe size={16} className="text-emerald-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">fashion-os-main</p>
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                <span className="text-[10px] text-emerald-500">{t.sidebar.status}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <header className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b",
          scrolled ? "bg-black/80 backdrop-blur-md border-zinc-800/50 py-3" : "bg-transparent border-transparent py-5"
        )}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold tracking-tight capitalize">
                {language === 'en' ? activeTab.replace('_', ' ') : {
                  'intelligence': '智能中心',
                  'dashboard': '趋势矩阵',
                  'memory': '审美记忆集群',
                  'data': '数据操作',
                  'graph': '知识图谱',
                  'generations': '实时生成',
                  'workers': '计算节点',
                  'registry': '系统注册表',
                  'auth': '权限与安全'
                }[activeTab as any] || activeTab}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'cn' : 'en')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all active:scale-95 border",
                  language === 'cn' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <Globe size={12} /> {language === 'en' ? "中文 (CN)" : "ENGLISH (EN)"}
              </button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                <input 
                  type="text" 
                  placeholder={t.common.search} 
                  className="bg-zinc-900/50 border border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-zinc-700 w-64 transition-colors"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-black rounded-full text-[10px] font-bold uppercase transition-transform active:scale-95">
                <Zap size={12} fill="currentColor" /> {t.common.runEngine}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <ErrorBoundary>
            <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Top Metrics Hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="flex flex-col justify-between py-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp size={80} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">{t.dashboard.velocity}</p>
                      <h4 className="text-3xl font-bold tracking-tighter text-emerald-400">+142%</h4>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-zinc-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      {t.dashboard.velocityDesc}
                    </div>
                  </Card>

                  <Card className="flex flex-col justify-between py-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Brain size={80} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">{t.dashboard.memory}</p>
                      <h4 className="text-3xl font-bold tracking-tighter">8.4M Vectors</h4>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-zinc-600">
                      <Database size={10} />
                      {t.dashboard.memoryDesc}
                    </div>
                  </Card>

                  <Card className="flex flex-col justify-between py-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Cpu size={80} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">{t.dashboard.inference}</p>
                      <h4 className="text-3xl font-bold tracking-tighter text-blue-400">0.82ms</h4>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-zinc-600">
                      <Monitor size={10} />
                      {t.dashboard.inferenceDesc}
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Semantic Memory Scatter */}
                  <Card title={t.dashboard.projection} icon={Network} className="lg:col-span-2">
                       <ChartPanel height={350}>
                        <ErrorBoundary>
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                              <XAxis type="number" dataKey="x" name={language === 'cn' ? '维度 A' : 'Dimension A'} stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} hide />
                              <YAxis type="number" dataKey="y" name={language === 'cn' ? '维度 B' : 'Dimension B'} stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} hide />
                              <ZAxis type="number" dataKey="z" range={[50, 400]} />
                              <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value, name, props) => [props?.payload?.style || 'Unknown', language === 'cn' ? '集群' : 'Cluster']}
                              />
                              <Scatter 
                                name="Styles" 
                                data={safeScatterData(mockMemoryClusters)} 
                                fill="#10b981" 
                                fillOpacity={0.6}
                                isAnimationActive={false}
                                shape={<SafeScatterPoint />}
                              >
                                {safeScatterData(mockMemoryClusters).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </ErrorBoundary>
                      </ChartPanel>
                      <div className="flex justify-center gap-6 mt-4">
                        {[
                          { key: 'Minimal', cn: '极简', en: 'Minimal' },
                          { key: 'Cyber', cn: '赛博', en: 'Cyber' },
                          { key: 'Vintage', cn: '复古', en: 'Vintage' },
                          { key: 'Avant', cn: '先锋', en: 'Avant' }
                        ].map((label, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500">
                            <span className={cn("w-2 h-2 rounded-full", i % 2 === 0 ? "bg-emerald-500" : "bg-blue-500")} />
                            {language === 'cn' ? label.cn : label.en}
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card title={t.dashboard.telemetry} icon={Zap}>
                    <div className="space-y-4">
                      {Array.isArray(metrics) && metrics.length > 0 ? metrics.slice(0, 6).map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800/50 rounded hover:border-emerald-500/30 transition-all group">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest truncate max-w-[120px]">{language === 'cn' ? (item.module === 'GPU-Node-01' ? 'GPU计算节点' : item.module) : item.module || 'System'}</p>
                            <p className="text-xs font-semibold">{item.metric || 'Metric'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-mono font-bold group-hover:text-emerald-400 transition-colors">
                              {typeof item.value === 'number' ? item.value.toLocaleString() : (item.value || '0')}
                            </p>
                            <StatusBadge status={item.status || 'active'} />
                          </div>
                        </div>
                      )) : (
                        <div className="py-8 text-center text-zinc-600 text-[10px] uppercase font-bold italic opacity-50">
                          {language === 'en' ? "Recalibrating Runtime Metrics..." : "正在重新校准运行时指标..."}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Trend Heatmap Map */}
                  <Card title={t.dashboard.velocityMap} icon={Globe}>
                    <div className="relative h-[350px] w-full bg-zinc-950 rounded border border-zinc-800 overflow-hidden flex items-center justify-center">
                      {/* Simplified visual map representation */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      <div className="grid grid-cols-5 gap-8 relative z-10 p-8 w-full">
                        {normalizeArray(mockTrendMap).map((m, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="relative mb-2">
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1] }} 
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
                              >
                                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                              </motion.div>
                              <div className="absolute -top-1 -right-1 bg-black px-1 rounded text-[8px] font-bold border border-zinc-700">+{m.heat}%</div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{language === 'cn' ? ({'Paris': '巴黎', 'Seoul': '首尔', 'New York': '纽约', 'Tokyo': '东京', 'Milan': '米兰'}[m.city] || m.city) : m.city}</span>
                            <span className="text-[8px] text-zinc-600 truncate max-w-full italic">{m.trend}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card title={t.dashboard.recognition} icon={Share2}>
                    <ChartPanel height={350}>
                      <ErrorBoundary>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={safePieData(mockBrandHeat)}
                              cx="50%"
                              cy="50%"
                              innerRadius={80}
                              outerRadius={120}
                              paddingAngle={8}
                              dataKey="value"
                              isAnimationActive={false}
                            >
                              {safePieData(mockBrandHeat).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || '#3f3f46'} stroke="none" />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ErrorBoundary>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t.dashboard.heatIndex}</p>
                        <h5 className="text-3xl font-black italic">94.2</h5>
                      </div>
                    </ChartPanel>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {normalizeArray(mockBrandHeat).map((brand, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-800">
                          <span className="text-[10px] font-bold text-zinc-400 capitalize truncate">{brand.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">+{Number(brand.value || 0) / 10}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Intelligence Feed */}

                {/* Intelligence Feed */}
                <Card title={t.dashboard.feed} icon={Activity}>
                  <div className="space-y-4">
                    {normalizeArray(mockTrends).map((trend, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded flex items-center justify-center",
                            trend.velocity > 2 ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-900 text-zinc-500"
                          )}>
                            <TrendingUp size={20} className={trend.velocity > 2 ? "animate-bounce" : ""} />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold">{trend.name}</h5>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{trend.category} • {language === 'cn' ? "4小时前检测到" : "Detected 4h ago"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-xs font-mono text-zinc-400">Score {trend.score}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded font-bold">HIGH</span>
                          </div>
                          <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${trend.score}%` }}
                              className="h-full bg-emerald-500" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'graph' && (
              <motion.div 
                key="graph"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">{t.graph.title}</h2>
                    <p className="text-zinc-500 text-sm">{t.graph.desc}</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                    <Share2 size={14} /> {t.graph.rebuild}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Graph Canvas Placeholder/Visual */}
                  <Card title={t.graph.neo4j} icon={Share2} className="lg:col-span-3 h-[600px] relative group">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <Share2 className="mx-auto mb-2 text-emerald-400 animate-pulse" size={40} />
                        <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">{t.graph.interactive}</p>
                      </div>
                    </div>
                    
                    <div className="w-full h-full flex items-center justify-center overflow-hidden border border-zinc-800 rounded-lg bg-zinc-950/50">
                      {/* Generative Visual for the Graph */}
                      <svg width="100%" height="100%" className="opacity-40">
                         {/* Nodes */}
                         {[
                           { x: 100, y: 150, label: 'Dior', type: 'Brand', color: '#10b981' },
                           { x: 250, y: 350, label: 'Minimalism', type: 'Style', color: '#3b82f6' },
                           { x: 500, y: 100, label: 'Y2K', type: 'Trend', color: '#f59e0b' },
                           { x: 650, y: 400, label: 'Cyber Pop', type: 'Style', color: '#3b82f6' },
                           { x: 400, y: 250, label: 'Luxury', type: 'Category', color: '#6366f1' },
                         ].map((node, i) => (
                           <g key={i}>
                             {/* Mock Edges */}
                             {i > 0 && (
                               <line 
                                 x1={node.x} y1={node.y} 
                                 x2={400} y2={250} 
                                 stroke="#27272a" strokeWidth="1" strokeDasharray="5,5" 
                               />
                             )}
                             <motion.circle 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               transition={{ delay: i * 0.2 }}
                               cx={node.x} cy={node.y} r="30" fill="transparent" stroke={node.color} strokeWidth="1" 
                             />
                             <text x={node.x} y={node.y + 50} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" className="uppercase tracking-widest">{node.label}</text>
                             <text x={node.x} y={node.y + 60} textAnchor="middle" fill={node.color} fontSize="8" className="opacity-50">{node.type}</text>
                           </g>
                         ))}
                      </svg>
                    </div>

                    <div className="absolute bottom-10 left-10 space-y-2 text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                       <div className="flex items-center gap-2">
                         <span className="w-2 h-2 bg-emerald-500 rounded-full" /> {language === 'cn' ? '品牌' : 'BRANDS'}
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="w-2 h-2 bg-blue-500 rounded-full" /> {language === 'cn' ? '风格' : 'STYLES'}
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="w-2 h-2 bg-amber-500 rounded-full" /> {language === 'cn' ? '趋势' : 'TRENDS'}
                       </div>
                    </div>
                  </Card>

                  {/* Relationship Insights */}
                  <div className="space-y-6">
                    <Card title={t.graph.affinities} icon={Activity}>
                      <div className="space-y-4">
                        {[
                          { source: 'Rick Owens', target: 'Avant Garde', weight: 0.94 },
                          { source: 'Balenciaga', target: 'Cyberpunk', weight: 0.88 },
                          { source: 'Luxury', target: 'Minimalism', weight: 0.82 },
                        ].map((rel, i) => (
                          <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 rounded">
                            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 mb-2">
                              <span>{rel.source}</span>
                              <ChevronRight size={10} />
                              <span>{rel.target}</span>
                            </div>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${(rel.weight || 0) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card title={t.graph.anomalies} icon={Bell}>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mb-4">
                        {language === 'cn' ? "系统在首尔集群中检测到" : "System detected an unusual correlation between"} <span className="text-amber-400 font-bold">{language === 'cn' ? '复古工装' : 'Vintage Workwear'}</span> {language === 'cn' ? "与" : "and"} <span className="text-amber-400 font-bold">{language === 'cn' ? '赛博流行' : 'Cyber Pop'}</span> {language === 'cn' ? "之间存在异常关联。" : "in the Seoul cluster."}
                      </p>
                      <button className="w-full py-2 border border-zinc-800 rounded text-[10px] font-bold uppercase hover:bg-zinc-800 transition-colors">
                        {t.common.investigate}
                      </button>
                    </Card>

                    <Card title={t.graph.vitality}>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase">{t.graph.nodes}</span>
                         <span className="text-xs font-mono">1.2M</span>
                       </div>
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase">{t.graph.edges}</span>
                         <span className="text-xs font-mono">42.8M</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase">{t.graph.density}</span>
                         <span className="text-xs font-mono">0.082</span>
                       </div>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div 
                key="data"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">{t.data.title}</h2>
                    <p className="text-zinc-500 text-sm">{t.data.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase hover:bg-zinc-800 transition-all flex items-center gap-2">
                      <Shield size={14} className="text-emerald-500" /> {t.data.stealth}
                    </button>
                    <button className="px-3 py-1.5 bg-sky-500 text-black rounded text-[10px] font-bold uppercase transition-transform active:scale-95 flex items-center gap-2">
                      <Zap size={14} /> {t.data.startCrawl}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Crawler Agents */}
                  <Card title={t.data.crawlers} icon={Server} className="lg:col-span-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-zinc-800/50">
                            <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4">{t.data.source}</th>
                            <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4">{t.data.tier}</th>
                            <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4">{t.data.status}</th>
                            <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4">{t.data.threshold}</th>
                            <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 text-right">{t.data.action}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {Array.isArray(crawlers) && crawlers.map((crawler, i) => (
                            <tr key={i} className="group hover:bg-zinc-900/30 transition-colors">
                              <td className="py-4 px-4">
                                <p className="text-sm font-bold">{crawler.source_name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono italic">{JSON.stringify(crawler.config)}</p>
                              </td>
                              <td className="py-4 px-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[10px] font-bold",
                                  crawler.source_tier === 1 ? "bg-emerald-500/10 text-emerald-500" :
                                  crawler.source_tier === 2 ? "bg-blue-500/10 text-blue-500" :
                                  "bg-zinc-800 text-zinc-400"
                                )}>
                                  T{crawler.source_tier}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full animate-pulse",
                                    crawler.status === 'idle' ? "bg-zinc-600" : "bg-emerald-500"
                                  )} />
                                  <span className="text-xs uppercase font-bold text-zinc-300">{crawler.status}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-mono text-xs text-zinc-500">{(crawler.quality_threshold * 100).toFixed(0)}%</td>
                              <td className="py-4 px-4 text-right">
                                <button className="p-2 bg-zinc-800 rounded border border-zinc-700 hover:bg-zinc-700 transition-colors group-hover:border-emerald-500/50">
                                   <Play size={12} className="text-emerald-500" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Proxy Pool Stats */}
                  <Card title={t.data.nodes} icon={Shield}>
                    <div className="space-y-4">
                       <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">{t.data.proxyHealth}</p>
                          <div className="flex items-baseline gap-2">
                             <span className="text-2xl font-black italic text-emerald-400">97.4%</span>
                             <span className="text-xs text-emerald-500/50">{t.data.uptime}</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          {Array.isArray(proxies) && proxies.map((proxy, i) => (
                             <div key={i} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded border border-zinc-800">
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-bold text-zinc-300">{language === 'cn' ? ({'US-West': '美国西部', 'EU-Paris': '欧洲巴黎', 'AS-Tokyo': '亚洲东京'}[proxy.region] || proxy.region) : proxy.region}</span>
                                   <span className="text-[8px] text-zinc-600 font-mono truncate max-w-[100px]">{proxy.proxy_url}</span>
                                </div>
                                <div className="text-right">
                                   <span className="text-[10px] font-mono text-emerald-500">{proxy.success_rate * 100}%</span>
                                   <p className="text-[8px] text-zinc-600">{proxy.latency_ms}ms</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* HD Restoration Rules */}
                   <Card title={t.data.restoration} icon={Maximize}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {Array.isArray(hydrationRules) && hydrationRules.map((rule, i) => (
                           <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-sky-500/50 transition-all flex flex-col justify-between h-32">
                              <div>
                                 <p className="text-xs font-black uppercase italic tracking-tighter text-white mb-1">{rule.domain}</p>
                                 <span className="text-[8px] px-1.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded uppercase font-bold">{language === 'cn' ? (rule.pattern_type === 'Regex' ? '正则匹配' : rule.pattern_type) : rule.pattern_type}</span>
                              </div>
                              <div className="text-[9px] font-mono text-zinc-500 truncate bg-black/50 p-1.5 rounded">
                                 {JSON.stringify(rule.rule_config)}
                              </div>
                           </div>
                         ))}
                      </div>
                   </Card>

                   {/* Semantic Crawler Logs */}
                   <Card title={t.data.ingestionLogs} icon={Terminal}>
                      <div className="space-y-2 font-mono text-[10px] h-[128px] overflow-y-auto custom-scrollbar">
                         {[
                           { t: '16:02:44', m: language === 'cn' ? '[Vogue] 无头浏览器已通过 Paris-Node-01 启动' : '[Vogue] Headless Chromium launched via Paris-Node-01' },
                           { t: '16:02:46', m: language === 'cn' ? '[Vogue] 激活完成：识别出 124 个资源标记' : '[Vogue] Hydration complete: 124 asset markers identified' },
                           { t: '16:02:48', m: language === 'cn' ? '[Dior] RESTORE_HD: 已解析 data-zoom-src -> 4096px 原图' : '[Dior] RESTORE_HD: Resolved data-zoom-src -> 4096px original' },
                           { t: '16:02:51', m: language === 'cn' ? '[隐形模式] 指纹已轮换：user-agent-v12.4.2' : '[Stealth] Fingerprint rotated: user-agent-v12.4.2' },
                           { t: '16:03:02', m: language === 'cn' ? '[质量] AI 抓取器：12 个资产因评分不足（< 0.9）被拒绝' : '[Quality] AI Scraper: 12 assets rejected (score < 0.9)' },
                           { t: '16:03:15', m: language === 'cn' ? '[记忆] Qdrant 插入：更新了 112 个向量 [Runway Tier]' : '[Memory] Qdrant insert: 112 vectors updated [Runway Tier]' },
                         ].map((log, i) => (
                           <div key={i} className="flex gap-2">
                             <span className="text-emerald-500/50">[{log.t}]</span>
                             <span className="text-zinc-400">{log.m}</span>
                           </div>
                         ))}
                         <div className="flex gap-2 items-center text-emerald-500/50 animate-pulse">
                           <span>{">"}</span>
                           <span className="w-1.5 h-3 bg-emerald-500/50" />
                         </div>
                      </div>
                   </Card>
                </div>

                {/* New: Quality Audit Logs */}
                <div className="grid grid-cols-1 gap-6">
                   <Card title={t.data.audits} icon={ShieldAlert}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {normalizeArray(auditLogs).map((log, i) => (
                           <div key={i} className="p-4 bg-zinc-950 border border-red-500/10 rounded-lg hover:border-red-500/30 transition-all">
                              <div className="flex items-start justify-between mb-2">
                                 <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-bold rounded uppercase">{t.data.rejected}</div>
                                 <span className="text-[8px] font-mono text-zinc-600 italic">ID: AUDIT-{log.id}</span>
                              </div>
                              <p className="text-[10px] font-bold text-zinc-300 truncate mb-1">{log.source_url}</p>
                              <div className="flex items-center gap-2 mb-3">
                                 <AlertCircle size={10} className="text-red-500" />
                                 <span className="text-[10px] text-zinc-500 font-bold uppercase">{language === 'cn' ? (log.rejection_reason === 'Low Aesthetic' ? '审美评分不足' : (log.rejection_reason === 'Duplicate' ? '重复数据' : log.rejection_reason)) : log.rejection_reason}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-900">
                                 <div>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase mb-1">{t.common.source}</p>
                                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden w-full">
                                       <div className="h-full bg-red-500/30" style={{ width: `${(log.luxury_score_failed || 0) * 100}%` }} />
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase mb-1">{t.metrics.score}</p>
                                    <div className="h-1 bg-zinc-900 rounded-full overflow-hidden w-full">
                                       <div className="h-full bg-red-500/30" style={{ width: `${(log.aesthetic_score_failed || 0) * 100}%` }} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'intelligence' && (
              <motion.div 
                key="intelligence"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">{t.intelligence.title}</h2>
                    <p className="text-zinc-500 text-sm">{t.intelligence.desc}</p>
                  </div>
                  <div className="gap-2 flex">
                    <button className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold uppercase hover:bg-zinc-800 transition-all">
                      {t.intelligence.recalibrate}
                    </button>
                    <button className="px-3 py-1.5 bg-emerald-500 text-black rounded text-[10px] font-bold uppercase transition-transform active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      {t.intelligence.update}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Brand DNA Profile */}
                  <Card title={t.intelligence.brandDna} icon={Layers} className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {normalizeArray(brandDna).map((brand, i) => (
                        <div key={i} className="p-4 bg-zinc-950 border border-zinc-800/50 rounded-lg group hover:border-emerald-500/30 transition-all flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[8px] font-black uppercase",
                                  brand.region === 'France' ? "bg-blue-500/20 text-blue-400" :
                                  brand.region === 'Italy' ? "bg-emerald-500/20 text-emerald-400" :
                                  brand.region === 'UK' ? "bg-rose-500/20 text-rose-400" :
                                  "bg-zinc-800 text-zinc-500"
                                )}>
                                  {brand.region}
                                </span>
                                <h4 className="text-sm font-black tracking-tight uppercase italic">{brand.brand_name}</h4>
                              </div>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{brand.archetype}</p>
                            </div>
                            <div className="text-[8px] font-mono text-zinc-700">DNA-V2.0</div>
                          </div>
                          
                          <div className="mt-4 space-y-3 flex-1">
                            {Object.entries(brand.dna_metrics || {}).map(([key, value]: [string, any], ki) => (
                              <div key={ki} className="space-y-1">
                                <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
                                  <span>{key} Analysis</span>
                                  <span>{Math.round(safeNumber(value, 0) * 100)}% Match</span>
                                </div>
                                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${safeNumber(value, 0) * 100}%` }}
                                    className="h-full bg-emerald-500/30 group-hover:bg-emerald-500 transition-colors" 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap gap-1">
                            {normalizeArray(brand.associated_trends).map((t: string, ti: number) => (
                              <span key={ti} className="px-1.5 py-0.5 bg-black text-[8px] font-bold text-zinc-500 border border-zinc-800 rounded uppercase">{t}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Dataset Quality Gauge */}
                  <Card title={t.intelligence.datasetScore} icon={Database}>
                    <div className="h-full flex flex-col items-center justify-center py-6">
                      <div className="relative w-48 h-48 mb-6">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                           <circle 
                              cx="96" cy="96" r="88" 
                              className="stroke-zinc-900 fill-none" 
                              strokeWidth="8"
                           />
                           <motion.circle 
                              cx="96" cy="96" r="88" 
                              className="stroke-emerald-500 fill-none" 
                              strokeWidth="8"
                              strokeDasharray={2 * Math.PI * 88}
                              initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                              animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - 0.942) }}
                              strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black italic tracking-tighter">94.2</span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">{t.intelligence.qualityIndex}</span>
                        </div>
                      </div>
                      
                      <div className="w-full space-y-3">
                        {[
                          { label: 'Runway Integrity', val: Number(datasetQuality?.avg_runway || 0.96), color: 'bg-emerald-500' },
                          { label: 'Editorial Depth', val: Number(datasetQuality?.avg_editorial || 0.94), color: 'bg-blue-500' },
                          { label: 'Luxury Alignment', val: Number(datasetQuality?.avg_luxury || 0.95), color: 'bg-amber-500' },
                          { label: 'Silhouette Index', val: Number(datasetQuality?.avg_silhouette || 0.92), color: 'bg-purple-500' },
                          { label: 'Audit Velocity', val: Number(datasetQuality?.audits?.avg_failed_luxury_density || 0.15), color: 'bg-red-500' },
                        ].map((m, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-1 h-8 rounded-full bg-zinc-800 overflow-hidden">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${(m.val || 0) * 100}%` }}
                                className={cn("w-full transition-all duration-1000", m.color)} 
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest leading-none mb-1">{m.label}</p>
                              <p className="text-[10px] font-mono text-zinc-300">{((m.val || 0) * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-zinc-800 w-full text-center">
                        <p className="text-[10px] text-zinc-500 font-medium">{t.intelligence.totalAssets}</p>
                        <p className="text-xl font-black italic tracking-tight">{datasetQuality?.total_assets?.toLocaleString() || '1,242,840'}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Agent Reasoning Logs */}
                   <Card title={t.intelligence.reasoning} icon={BrainCircuit}>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                         {normalizeArray(agentLogic).length > 0 ? normalizeArray(agentLogic).map((log, i) => (
                           <div key={i} className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black uppercase italic tracking-tighter">{log.agent_name}</span>
                                 </div>
                                 <span className="text-[8px] font-mono text-zinc-600 italic">TASK-{log.task_id}</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 font-medium italic mb-4 leading-relaxed bg-black/40 p-3 rounded border border-zinc-900">
                                 "{log.thought_process}"
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800">
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase mb-1">Style Logic</p>
                                    <p className="text-[9px] font-mono text-emerald-500/80 truncate opacity-70">{JSON.stringify(log.style_logic)}</p>
                                 </div>
                                 <div className="p-2 bg-zinc-900/50 rounded border border-zinc-800">
                                    <p className="text-[8px] font-bold text-zinc-600 uppercase mb-1">Confidence</p>
                                    <div className="flex items-center gap-2">
                                       <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                          <div className="h-full bg-blue-500" style={{ width: `${(log.decision_confidence || 0) * 100}%` }} />
                                       </div>
                                       <span className="text-[10px] font-mono text-blue-400">{((log.decision_confidence || 0) * 100).toFixed(0)}%</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                         )) : (
                            <div className="py-12 text-center">
                               <Cpu className="mx-auto text-zinc-800 mb-4 animate-bounce" size={32} />
                               <p className="text-xs text-zinc-600 uppercase font-bold tracking-widest italic opacity-50">{t.intelligence.polling}</p>
                            </div>
                         )}
                      </div>
                   </Card>
                   {/* Outfit Compatibility Board */}
                   <Card title={t.intelligence.outfitLogic} icon={Zap}>
                      <div className="space-y-4">
                         {Array.isArray(outfitLogic) && outfitLogic.map((logic, i) => {
                           const score = Number(logic.compatibility_score || 0);
                           return (
                             <div key={i} className="p-4 bg-zinc-950 border border-zinc-800 rounded flex gap-4 items-center">
                               <div className={cn(
                                 "w-10 h-10 rounded-full flex items-center justify-center border font-bold text-xs",
                                 score > 0.9 ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" : "border-zinc-700 bg-zinc-800 text-zinc-500"
                               )}>
                                 {Math.round(score * 100)}
                               </div>
                               <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                   <span className="text-[10px] font-bold text-white uppercase italic">{logic.item_a_style || 'N/A'}</span>
                                   <ChevronRight size={10} className="text-zinc-700" />
                                   <span className="text-[10px] font-bold text-white uppercase italic">{logic.item_b_style || 'N/A'}</span>
                                 </div>
                                 <p className="text-[10px] text-zinc-500 ">{logic.reasoning || t.intelligence.calculating}</p>
                               </div>
                               <div className="text-right">
                                 <span className="text-[8px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded uppercase tracking-[0.1em]">{logic.seasonal_alignment || 'FW2026'}</span>
                               </div>
                             </div>
                           );
                         })}
                      </div>
                   </Card>

                   {/* Expert Agent Reasoning Log */}
                   <Card title={t.intelligence.agentLogs} icon={Terminal}>
                      <div className="space-y-3 font-mono text-[10px]">
                         {[
                           { time: '14:22:04', agent: 'Trend Analyst', msg: 'Detected trend mutation: Minimalist Luxury merging with Tech Street (Seoul Cluster)' },
                           { time: '14:22:08', agent: 'Styling Agent', msg: 'Recalibrating outfit compatibility scores based on new Rick Owens DNA extraction' },
                           { time: '14:22:15', agent: 'Calibration Agent', msg: 'Calibrating CLIP embeddings for "Draping" and "Silhouette Balance"' },
                           { time: '14:22:42', agent: 'System', msg: 'Fashion Brain memory update complete. Semantic density optimized.' },
                         ].map((log, i) => (
                           <div key={i} className="flex gap-3 text-zinc-500 hover:text-zinc-300 transition-colors">
                              <span className="text-emerald-500/50">[{log.time}]</span>
                              <span className="font-bold text-zinc-400 capitalize">{log.agent}:</span>
                              <span>{log.msg}</span>
                           </div>
                         ))}
                         <div className="flex gap-2 items-center text-emerald-500/50 animate-pulse mt-4">
                           <span>{">"}</span>
                           <span className="w-2 h-4 bg-emerald-500/50" />
                         </div>
                      </div>
                   </Card>
                </div>
              </motion.div>
            )}

            {/* Other tabs placeholder */}
            {!['dashboard', 'intelligence', 'memory', 'graph', 'data', 'generations', 'workers'].includes(activeTab) && (
              <motion.div 
                key="tab-placeholder"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-[70vh] text-center"
              >
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <Database size={40} className="text-emerald-500" />
                </div>
                 <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase italic">
                  {t.placeholder.initializing}
                </h2>
                <div className="max-w-md space-y-4">
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {t.placeholder.desc}
                  </p>
                  <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800 font-mono text-[10px] text-zinc-400 text-left">
                    <div className="flex justify-between mb-1">
                      <span>{">"} STAGING_DB_POSTGRES</span>
                      <span className="text-emerald-400">{language === 'cn' ? '已连接' : 'CONNECTED'}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>{">"} STAGING_DB_QDRANT</span>
                      <span className="text-emerald-400">{language === 'cn' ? '已连接' : 'CONNECTED'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{">"} STAGING_DB_NEO4J</span>
                      <span className="text-amber-400">{language === 'cn' ? '正在准备' : 'PROVISIONING'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-12">
                   <button className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {t.placeholder.trace}
                  </button>
                  <button onClick={() => setActiveTab('dashboard')} className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-black text-xs uppercase tracking-[0.2em] rounded hover:text-white transition-all">
                    {t.placeholder.return}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

