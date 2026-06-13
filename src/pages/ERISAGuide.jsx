import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, Users, Calendar, Shield, AlertTriangle, Scale, Heart } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";

const sections = [
  {
    icon: FileText,
    title: "Form 5500 Annual Return/Report",
    content: `**Who must file:** Every ERISA-covered plan with 100+ participants (large plan), or plans with fewer participants that don't qualify for an exemption.

**Deadline:** 7 months after plan year end (July 31 for calendar-year plans).

**Extension:** File Form 5558 for a 2½-month extension (October 15 for calendar-year plans). If the employer's tax return is extended, the Form 5500 is automatically extended to the same date.

**Key Schedules:**
- **Schedule A** — Insurance information (premiums, commissions, carriers)
- **Schedule C** — Service provider and trustee information (large plans)
- **Schedule H** — Financial information (large plans, requires audit)
- **Schedule I** — Financial information (small plans, no audit required)

**100-Participant Rule:**
- Plans with 100+ eligible participants at the beginning of the plan year are "large plans"
- Large plans must attach an independent qualified public accountant (IQPA) audit report
- The 80-120 rule allows plans near the threshold to continue filing as small or large based on prior year

**Penalties:** Late filing can result in DOL penalties of $250/day up to $150,000. IRS penalties are $250/day up to $150,000.`,
  },
  {
    icon: FileText,
    title: "Schedule A (Form 5500)",
    content: `**Purpose:** Reports insurance contract information including premiums paid, commissions, and fees received by brokers and insurance carriers.

**Who files:** Plans that hold insurance contracts (fully insured or partially insured plans).

**Key Information:**
- Insurance carrier name and EIN
- Contract/policy number
- Type of benefit (medical, dental, life, etc.)
- Premiums paid during the plan year
- Commissions and fees paid to agents, brokers, and service providers
- Experience-rated refunds

**Broker Responsibilities:**
- Assist employers in compiling premium and commission data from carriers
- Ensure all Schedule A data is complete before Form 5500 filing
- Verify commission disclosures are accurate (ERISA Section 408(b)(2) compliance)`,
  },
  {
    icon: FileText,
    title: "Form M-1 (MEWA Filing)",
    content: `**Purpose:** Required annual filing for Multiple Employer Welfare Arrangements (MEWAs).

**Deadline:** March 1 following the calendar year (or 90 days after becoming a MEWA).

**Who must file:** Any MEWA or Entity Claiming Exception (ECE) that provides health benefits.

**Key Points:**
- Filed electronically through EFAST2
- Must report number of employers and employees covered
- Includes information about the arrangement's administrator and operations
- Failure to file can result in $250/day penalty up to $150,000
- States may impose additional MEWA registration requirements`,
  },
  {
    icon: BookOpen,
    title: "Summary Plan Description (SPD)",
    content: `**Purpose:** The primary document that explains plan rules, benefits, and participant rights in understandable language.

**Distribution Requirements:**
- Must be provided to participants within 90 days of becoming covered (new employees)
- Updated SPD must be furnished every 5 years if the plan has been amended
- Even without amendments, a new SPD must be distributed every 10 years

**Required Content:**
- Plan name, employer name, and EIN
- Type of plan and type of administration
- Name and address of plan administrator
- Eligibility requirements and benefits description
- Claims procedures and appeal process
- Circumstances that may result in disqualification, ineligibility, or denial/loss of benefits
- COBRA continuation coverage rights
- Statement of ERISA rights

**Broker Role:** Assist employers in drafting and reviewing SPDs for accuracy and ERISA compliance.`,
  },
  {
    icon: FileText,
    title: "Summary of Material Modifications (SMM) & SBC",
    content: `**SMM — Summary of Material Modifications:**
- Must be distributed within 210 days after the end of the plan year in which the change was adopted
- Or within 60 days after a material reduction in covered services or benefits
- Can be a standalone document or incorporated into a new SPD

**SBC — Summary of Benefits and Coverage:**
- Required under the ACA for all group health plans
- Must be provided at open enrollment, upon request, and to special enrollees
- Uses a standardized DOL template (max 4 double-sided pages)
- Must include coverage examples, cost-sharing details, and excluded services
- 60-day advance notice required for mid-year material modifications

**Penalties:** Failure to provide SBC can result in a $1,363/day penalty per affected individual.`,
  },
  {
    icon: FileText,
    title: "Summary Annual Report (SAR)",
    content: `**Purpose:** A condensed version of the Form 5500 annual report that must be distributed to plan participants.

**Deadline:** Must be provided within 9 months after plan year end (or 2 months after the Form 5500 due date, including extensions).

**Distribution:** Can be mailed, emailed (with DOL electronic delivery requirements), or hand-delivered.

**Content:** Includes basic financial information about the plan — total plan assets, expenses, and a description of participants' right to receive a copy of the full annual report.

**Broker Role:** Help employers draft the SAR using DOL model language and ensure timely distribution.`,
  },
  {
    icon: Shield,
    title: "Wrap Plan Documents",
    content: `**Purpose:** A wrap document "wraps around" the insurance carrier's certificates of coverage to create a single, ERISA-compliant plan document.

**Why Needed:**
- Insurance certificates alone don't satisfy ERISA's plan document requirements
- Wrap documents fill compliance gaps (claims procedures, ERISA rights statements, fiduciary responsibilities)
- Creates a unified plan structure for Form 5500 filing

**Key Components:**
- Named fiduciaries and plan administrator
- Claims and appeals procedures meeting DOL requirements
- ERISA rights statement
- Amendment and termination procedures
- Plan funding and insurance arrangement details

**Best Practice:** Review wrap documents annually and update whenever plans are added, removed, or significantly changed.`,
  },
  {
    icon: Shield,
    title: "Fidelity Bond Requirements",
    content: `**ERISA Section 412 Requirement:**
- Every person who "handles" plan funds or property must be bonded
- Minimum bond: 10% of funds handled in the preceding year
- Minimum bond amount: $1,000
- Maximum required bond: $500,000 (or $1,000,000 for plans holding employer securities)

**Who Must Be Bonded:**
- Plan administrators, trustees, and fiduciaries
- Anyone with access to plan funds (including check signers, investment managers)
- Third-party service providers who handle plan assets

**Types of Bonds:**
- Individual bonds for specific persons
- Blanket bonds covering all plan officials
- Must be obtained from a surety company approved by the Treasury Department

**Broker Role:** Remind employers to verify bond amounts annually and increase coverage if plan assets grow.`,
  },
  {
    icon: Heart,
    title: "COBRA & Health Coverage Notices",
    content: `**COBRA (Consolidated Omnibus Budget Reconciliation Act):**
- Applies to employers with 20+ employees
- General rights notice within 90 days of coverage beginning
- Election notice within 44 days of qualifying event
- Continuation period: 18 months (36 months for certain events)

**HIPAA Notice of Privacy Practices:**
- Must be provided at enrollment and every 3 years thereafter
- Must describe how PHI may be used and individuals' rights

**WHCRA (Women's Health and Cancer Rights Act):**
- Annual notice required regarding mastectomy-related benefits
- Can be included in SPD or distributed separately

**Newborns' and Mothers' Health Protection Act:**
- Notice of minimum maternity stay benefits

**CHIPRA (Children's Health Insurance Program Reauthorization Act):**
- Annual notice to employees in states with premium assistance programs
- Notice required within the plan's open enrollment materials

**Michelle's Law:**
- Continuation of coverage for dependent students on medical leave`,
  },
  {
    icon: Calendar,
    title: "ACA Reporting (Forms 1094-C & 1095-C)",
    content: `**Who Must Report:**
- Applicable Large Employers (ALEs): 50+ full-time equivalent employees
- Self-insured plans (regardless of employer size)

**Form 1094-C:** Transmittal form filed with the IRS summarizing employer-level data.
**Form 1095-C:** Individual statements provided to each full-time employee.

**Deadlines:**
- Furnish 1095-C to employees: March 2 (or next business day)
- File 1094-C/1095-C with IRS: March 31 (electronic) or February 28 (paper)

**Penalties:** $310 per return for failure to file or furnish correct statements (2024).

**Broker Role:** Assist employers in tracking employee hours, determining ALE status, and preparing or reviewing 1094-C/1095-C submissions.`,
  },
  {
    icon: Scale,
    title: "PCORI Fees & Other Assessments",
    content: `**PCORI Fee (Patient-Centered Outcomes Research Institute):**
- Applies to self-insured health plans and insurance carriers
- Due July 31 annually, filed on IRS Form 720
- Fee is per covered life, adjusted annually ($3.22 per life for plan years ending 2024)
- Self-funded plans: employer pays; fully insured: carrier pays

**Transitional Reinsurance Fee (expired for 2017+):**
- Was required for 2014-2016 plan years

**Risk Corridor & Risk Adjustment:**
- Primarily applicable to insurance carriers, not employers

**Broker Role:** Remind self-funded plan sponsors of the PCORI fee deadline and assist with the calculation using average count or snapshot method.`,
  },
  {
    icon: Users,
    title: "Fiduciary Responsibilities",
    content: `**ERISA Fiduciary Duties:**
- **Duty of Loyalty:** Act solely in the interest of plan participants
- **Duty of Prudence:** Act with the skill, care, and diligence of a prudent expert
- **Diversification:** Diversify plan investments to minimize risk of large losses
- **Plan Document Compliance:** Follow the terms of the plan document

**Who Is a Fiduciary:**
- Anyone who exercises discretionary authority over plan management or assets
- Anyone who provides investment advice for a fee
- Plan administrators and trustees by default

**Prohibited Transactions (ERISA Section 406):**
- Self-dealing by fiduciaries
- Transactions with parties in interest (without an exemption)
- Certain financial transactions between the plan and the employer

**Section 408(b)(2) Disclosure:**
- Service providers must disclose all compensation and fees
- Applies to brokers, advisors, recordkeepers, and TPAs
- Must be provided "reasonably in advance" of contract execution

**Broker Role:** Ensure proper fee disclosures, help employers understand their fiduciary duties, and assist with benchmarking service provider fees.`,
  },
];

export default function ERISAGuide() {
  return (
    <div>
      <PageHeader
        title="ERISA Compliance Guide"
        description="Reference guide for key ERISA reporting and compliance requirements"
      />

      <div className="grid gap-3">
        <Accordion type="multiple" className="space-y-2">
          {sections.map((section, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-heading font-semibold text-left">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="pl-11 prose prose-sm max-w-none text-muted-foreground">
                  {section.content.split("\n").map((line, j) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <h4 key={j} className="font-semibold text-foreground mt-3 mb-1 text-sm">{line.replace(/\*\*/g, "")}</h4>;
                    }
                    if (line.startsWith("**")) {
                      const parts = line.split("**");
                      return (
                        <p key={j} className="text-sm leading-relaxed">
                          {parts.map((part, k) => k % 2 === 1 ? <strong key={k} className="text-foreground">{part}</strong> : part)}
                        </p>
                      );
                    }
                    if (line.startsWith("- ")) {
                      return <li key={j} className="text-sm ml-4 list-disc">{line.substring(2)}</li>;
                    }
                    if (line.trim() === "") return <br key={j} />;
                    return <p key={j} className="text-sm leading-relaxed">{line}</p>;
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}