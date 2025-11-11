/**
 * Game Board Page Object Model
 * Represents the main game interface for political simulation
 */
import type { Page, Locator } from "@playwright/test";

export class GameBoardPage {
  readonly page: Page;
  readonly proposalsList: Locator;
  readonly createProposalButton: Locator;
  readonly proposalTitleInput: Locator;
  readonly proposalDescriptionInput: Locator;
  readonly submitProposalButton: Locator;
  readonly leaveGameButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proposalsList = page.getByRole("list").filter({ hasText: /proposals/i });
    this.createProposalButton = page.getByRole("button", { name: /create proposal|new proposal/i });
    this.proposalTitleInput = page.getByLabel(/title/i);
    this.proposalDescriptionInput = page.getByLabel(/description/i);
    this.submitProposalButton = page.getByRole("button", { name: /submit proposal/i });
    this.leaveGameButton = page.getByRole("button", { name: /leave game/i });
  }

  /**
   * Navigate to game board (requires being in a game)
   */
  async goto(gameId: string) {
    await this.page.goto(`/game/${gameId}`);
  }

  /**
   * Create a new proposal
   */
  async createProposal(title: string, description: string) {
    await this.createProposalButton.click();
    await this.proposalTitleInput.fill(title);
    await this.proposalDescriptionInput.fill(description);
    await this.submitProposalButton.click();
  }

  /**
   * Vote on a proposal by title
   */
  async voteOnProposal(proposalTitle: string, vote: "aye" | "nay" | "abstain") {
    const proposalItem = this.page.getByRole("listitem").filter({ hasText: proposalTitle });
    const voteButton = proposalItem.getByRole("button", { name: new RegExp(vote, "i") });
    await voteButton.click();
  }

  /**
   * Get proposal titles currently displayed
   */
  async getProposalTitles(): Promise<string[]> {
    const items = await this.proposalsList.getByRole("listitem").all();
    return Promise.all(
      items.map(async (item) => {
        const heading = item.getByRole("heading");
        return (await heading.textContent()) || "";
      }),
    );
  }

  /**
   * Get vote count for a proposal
   */
  async getVoteCounts(proposalTitle: string): Promise<{
    aye: number;
    nay: number;
    abstain: number;
  }> {
    const proposalItem = this.page.getByRole("listitem").filter({ hasText: proposalTitle });

    const ayeText = await proposalItem.getByText(/aye:\s*(\d+)/i).textContent();
    const nayText = await proposalItem.getByText(/nay:\s*(\d+)/i).textContent();
    const abstainText = await proposalItem.getByText(/abstain:\s*(\d+)/i).textContent();

    return {
      aye: Number.parseInt(ayeText?.match(/\d+/)?.[0] || "0"),
      nay: Number.parseInt(nayText?.match(/\d+/)?.[0] || "0"),
      abstain: Number.parseInt(abstainText?.match(/\d+/)?.[0] || "0"),
    };
  }

  /**
   * Leave the current game
   */
  async leaveGame() {
    await this.leaveGameButton.click();
  }

  /**
   * Wait for proposals list to load
   */
  async waitForProposalsLoad() {
    await this.proposalsList.waitFor({ state: "visible" });
  }
}
