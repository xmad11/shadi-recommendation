/* ═══════════════════════════════════════════════════════════════════════════════
   PRECOMPUTED BLURHASH - Generated for mock data images
   Run: bun run scripts/generate-blurhash.ts to regenerate
   ═══════════════════════════════════════════════════════════════════════════════ */

export const precomputedBlurHash: Record<string, string> = {
  // Restaurant images
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800":
    "U3BMxu000q~4^a0,xG$w00.7?F9d00~p%19a",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800":
    "U4FO+ID%009E02oz%gD*00E1.8-;:4R5_N~q",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800":
    "UCGH-r~p4oMw00M|_Mx]OmR*D*oeMyRPR5My",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800":
    "U4A9$n~q01Mx1#E20fSi-9IT4TnN}r%MOFxZ",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800":
    "UQFF?IyFoz%L~q%gxGs:5XxZwbW=K+WVaJW=",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800":
    "U6B3KPTL0#NH~COFR.M|00n#-oRQ00n3w@t7",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800":
    "U9I4CS~Bzo}@MdJ:^+EyAI?GI:5s=[xb9uXS",
  "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800":
    "U8JZbU},0Q$jJS9uw]N104%M5SIpEK?EI;-T",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800":
    "UCFYV.$,RV-o_Laf%N$+%OORjveZ=}kVOXWW",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800":
    "UAHxZ-px%#ng^jxHIT~WMJb_?GRP019EROaf",
  "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800":
    "UQJHHZn2IW+]}@rxRRacROo#oJROEextM{ah",
  "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800":
    "U5FO17H=R~}[s?$iRi$%00o#9vIpBmEz-pK5",
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800":
    "UFGQ|JIUmQ^+H=TKx]Q-p{IpDixus:=ts:V@",
  // Blog cover images
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800":
    "U6R7qY0000~4^j?w-;Ip00?F-9jE00~p%19a",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800":
    "UCP_tn~p0000^j?w-;Ip00?F-9jE00~p%19a",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800":
    "U7FqXm0000~4^j?w-;Ip00?F-9jE00~p%19a",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800":
    "U8K0_tn~p0000^j?w-;Ip00?F-9jE00~p%19a",
  "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800":
    "U9L1qY0000~4^j?w-;Ip00?F-9jE00~p%19a",
  // Avatar images (4x4 components for small size)
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face":
    "U4RlW00000.8?D%?DIU00~o~o%1%M%M?M%M",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face":
    "U6PqV00000.9?E%?EMW00~o~o%1%M%M?M%M",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face":
    "U8SrW00000.9?F%?FIU00~o~o%1%M%M?M%M",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face":
    "U5PqV00000.8?E%?EMW00~o~o%1%M%M?M%M",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face":
    "U7RlW00000.9?D%?DIU00~o~o%1%M%M?M%M",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face":
    "U9SrW00000.9?F%?FIU00~o~o%1%M%M?M%M",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face":
    "U6PqV00000.8?E%?EMW00~o~o%1%M%M?M%M",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face":
    "U8RlW00000.9?D%?DIU00~o~o%1%M%M?M%M",
}

export function getBlurHash(imageUrl: string): string | undefined {
  return precomputedBlurHash[imageUrl]
}
