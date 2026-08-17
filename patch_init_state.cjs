const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const helper = `
const getInitialState = (key, defaultState) => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const item = window.localStorage.getItem(\`asm_\${key}\`);
    return item ? JSON.parse(item) : defaultState;
  } catch (error) {
    return defaultState;
  }
};
`;

code = code.replace(
  "  const [rates, setRates] = useState<JewelleryRates>(enforceRounding(INITIAL_RATES));",
  helper + "\n  const [rates, setRates] = useState<JewelleryRates>(enforceRounding(getInitialState('rates', INITIAL_RATES)));"
);

code = code.replace(
  "  const [trends, setTrends] = useState<RateTrends>(INITIAL_TRENDS);",
  "  const [trends, setTrends] = useState<RateTrends>(getInitialState('trends', INITIAL_TRENDS));"
);

code = code.replace(
  "  const [displaySetting, setDisplaySetting] = useState<DisplaySetting>(\n    INITIAL_DISPLAY_SETTING,\n  );",
  "  const [displaySetting, setDisplaySetting] = useState<DisplaySetting>(\n    getInitialState('displaySetting', INITIAL_DISPLAY_SETTING),\n  );"
);

code = code.replace(
  "  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);",
  "  const [branches, setBranches] = useState<Branch[]>(getInitialState('branches', INITIAL_BRANCHES));"
);

code = code.replace(
  "  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);",
  "  const [media, setMedia] = useState<MediaItem[]>(getInitialState('media', INITIAL_MEDIA));"
);

code = code.replace(
  "  const [promos, setPromos] = useState<PromoItem[]>(INITIAL_PROMOS);",
  "  const [promos, setPromos] = useState<PromoItem[]>(getInitialState('promos', INITIAL_PROMOS));"
);

code = code.replace(
  "  const [saleStatuses, setSaleStatuses] =\n    useState<SaleStatusItem[]>(INITIAL_SALE_STATUS);",
  "  const [saleStatuses, setSaleStatuses] =\n    useState<SaleStatusItem[]>(getInitialState('saleStatuses', INITIAL_SALE_STATUS));"
);

code = code.replace(
  "  const [displays, setDisplays] =\n    useState<ConnectedDisplay[]>(INITIAL_DISPLAYS);",
  "  const [displays, setDisplays] =\n    useState<ConnectedDisplay[]>(getInitialState('displays', INITIAL_DISPLAYS));"
);

code = code.replace(
  "  const [systemConfig, setSystemConfig] = useState<SystemConfig>(\n    INITIAL_SYSTEM_CONFIG,\n  );",
  "  const [systemConfig, setSystemConfig] = useState<SystemConfig>(\n    getInitialState('systemConfig', INITIAL_SYSTEM_CONFIG),\n  );"
);

fs.writeFileSync('src/App.tsx', code);
