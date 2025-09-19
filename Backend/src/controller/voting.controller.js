import Voting from "../model/voting.model.js";
import Candidate from "../model/candidate.model.js";
import blockchain from "../utils/blockchain.js";

//Create a new Election
export const createVoting = async (req, res) => {
  let newElection = null;

  try {
    const { title, description, startTime } = req.body;

    console.log("📊 Creating election with data:", { title, description, startTime });

    // Check if there's an election in active phases
    const existingElection = await Voting.findOne({
      phase: { $in: ["pending", "registration", "voting", "result"] }
    });

    if (existingElection) {
      console.log("❌ Active election exists:", existingElection.title);
      return res.status(400).json({
        message: "An election is already running or pending"
      });
    }

    // 🔧 STEP 1: Create election in MongoDB FIRST
    console.log("📝 Creating election in database...");
    newElection = new Voting({
      title,
      description,
      startTime: new Date(startTime),
      phase: "pending",
      blockchainElectionId: null  // Will be set after blockchain creation
    });

    await newElection.save();
    console.log("✅ Election created in database:", newElection._id);

    // 🔧 STEP 2: Create election on blockchain AFTER database success
    console.log("⛓️ Creating election on blockchain...");

    try {
      const tx = await blockchain.createElection();

      console.log("TX Response:", tx);

      // 🔧 SIMPLE FIX: Your blockchain.createElection() already handles everything
      if (!tx || !tx.electionId || !tx.receipt) {
        throw new Error("Invalid blockchain response");
      }

      if (tx.receipt.status !== 1) {
        throw new Error("Blockchain transaction failed");
      }

      console.log("✅ Election created on blockchain with ID:", tx.electionId);
      console.log("✅ Transaction hash:", tx.receipt.hash);

      // Update database with blockchain election ID
      newElection.blockchainElectionId = tx.electionId;
      await newElection.save();
      console.log("✅ Database updated with blockchain election ID");

      res.status(201).json({
        message: "Election created successfully on both database and blockchain",
        election: newElection,
        transactionHash: tx.receipt.hash
      });

    } catch (blockchainError) {
      console.error("❌ Blockchain creation failed:", blockchainError);

      // 🔧 ROLLBACK: Delete the database record if blockchain fails
      console.log("🔄 Rolling back database record...");
      await Voting.findByIdAndDelete(newElection._id);
      console.log("✅ Database record deleted due to blockchain failure");

      return res.status(500).json({
        message: "Failed to create election on blockchain. Database rollback completed.",
        error: blockchainError.message
      });
    }

  } catch (databaseError) {
    console.error("❌ Database creation failed:", databaseError);

    // If database creation fails, no need to rollback blockchain (nothing was created)
    return res.status(500).json({
      message: "Failed to create election in database",
      error: databaseError.message
    });
  }
};

//Returning only the latest election
export const getElection = async (req, res) => {
  try {
    // Find the latest election that is NOT ended
    const election = await Voting.findOne({
      phase: { $ne: "ended" } // $ne means "not equal to"
    }).sort({ createdAt: -1 });

    if (!election) {
      return res.status(404).json({ message: "No election found" });
    }

    return res.json({ election });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

//Get all the elections
export const listAllElections = async (req, res) => {
  try {
    const elections = await Voting.find().sort({ createdAt: -1 });
    res.json({ elections });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch elections", error: error.message });
  }
}

//Register Phase => VotingPhase
export const startVotingPhase = async (req, res) => {
  try {
    const election = await Voting.findOne().sort({ createdAt: -1 })
    if (!election) {
      return res.status(404).json({ message: "No election found" });
    }

    if (election.phase !== "registration") {
      return res.status(400).json({ message: "Election must be in Registration phase to move to Voting" });
    }

    election.phase = "voting";
    await election.save();

    res.json({ message: "Election moved to voting phase", election });
  } catch (error) {
    res.status(500).json({ message: "Failed to update phase", error: error.message });
  }
}

//Voting Phase => Result Phase
export const startResultPhase = async (req, res) => {
  try {
    const election = await Voting.findOne().sort({ createdAt: -1 })
    if (!election) {
      return res.status(404).json({ message: "No election found" });
    }

    if (election.phase !== "voting") {
      return res.status(400).json({ message: "Election must be in Voting phase to move to Result" });
    }

    election.phase = "result";
    await election.save();

    // 🔧 FIX: Add missing response
    res.json({ message: "Election moved to result phase", election });
  } catch (error) {
    res.status(500).json({ message: "Failed to update phase", error: error.message });
  }
}

export const endElection = async (req, res) => {
  try {
    console.log("🔚 Ending election...");

    // Find the current active election
    const activeElection = await Voting.findOne({
      phase: { $in: ["registration", "voting", "result"] }
    });

    if (!activeElection) {
      return res.status(400).json({
        message: "No active election found to end"
      });
    }

    console.log(`Found active election: ${activeElection.title} in ${activeElection.phase} phase`);

    // 🔧 ADD: End election on blockchain if it has a blockchain ID
    if (activeElection.blockchainElectionId) {
      try {
        console.log("🔗 Ending election on blockchain...");
        const tx = await blockchain.endElection();

        console.log("TX Response:", tx);

        // Handle the transaction response (based on your blockchain setup)
        if (tx && tx.receipt) {
          // Your blockchain returns custom response with receipt
          if (tx.receipt.status !== 1) {
            throw new Error("Blockchain transaction failed");
          }
          console.log("✅ Blockchain election ended successfully:", tx.receipt.hash);
        } else if (tx && typeof tx.wait === 'function') {
          // Standard ethers transaction
          const receipt = await tx.wait();
          if (receipt.status !== 1) {
            throw new Error("Blockchain transaction failed");
          }
          console.log("✅ Blockchain election ended successfully:", receipt.hash);
        } else {
          console.log("⚠️ Blockchain response format unknown, continuing with database update");
        }
      } catch (blockchainError) {
        console.error("❌ Failed to end election on blockchain:", blockchainError);
        // Continue with database update even if blockchain fails
        console.log("⚠️ Continuing with database update despite blockchain error");
      }
    } else {
      console.log("⚠️ No blockchain ID found, only updating database");
    }

    // Update election to ended phase in database
    activeElection.phase = "ended";
    activeElection.updatedAt = new Date();
    await activeElection.save();

    console.log(`✅ Election "${activeElection.title}" ended successfully`);

    res.json({
      message: `Election "${activeElection.title}" ended successfully`,
      election: activeElection
    });

  } catch (error) {
    console.error("❌ End election error:", error);
    res.status(500).json({
      message: "Failed to end election",
      error: error.message
    });
  }
};

//To cast votes
export const castVote = async (req, res) => {
  try {
    const { candidateWalletAddress } = req.body;
    const voterWalletAddress = req.user.userWalletAddress;

    if (!candidateWalletAddress || !voterWalletAddress) {
      return res.status(400).json({ message: "Candidate or voter wallet address is missing" });
    }

    const election = await Voting.findOne().sort({ createdAt: -1 });
    if (!election) {
      return res.status(404).json({ message: "No election found" });
    }

    if (election.phase !== "voting") {
      return res.status(400).json({ message: "Election is not in Voting phase" });
    }

    // Check if candidate exists and is confirmed
    const candidate = await Candidate.findOne({
      candidateWalletAddress: candidateWalletAddress.toLowerCase(),
      election: election._id,
      status: "confirmed"
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found or not confirmed for this election" });
    }


    const tx = await blockchain.vote(candidateWalletAddress);
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      return res.status(500).json({ message: "Vote transaction failed." });
    }

    return res.status(200).json({
      message: `Vote cast successfully for ${candidate.name}`,
      candidateName: candidate.name,
      txHash: receipt.transactionHash
    });

  } catch (error) {
    console.error("castVote error:", error);
    return res.status(500).json({ message: "Voting failed", error: error.message });
  }
};

//To get the result of the election
export const getResults = async (req, res) => {
  try {
    console.log("📊 Fetching election results...");

    // Find the election in result phase
    const election = await Voting.findOne().sort({ createdAt: -1 });
    if (!election || election.phase !== "result") {
      return res.status(400).json({ message: "Results are not available yet." });
    }

    console.log("Found election:", election.title, "Blockchain ID:", election.blockchainElectionId);

    // Get confirmed candidates from DB
    const candidates = await Candidate.find(
      { election: election._id, status: "confirmed" },
      "name party slogan logo candidateWalletAddress"
    );

    console.log("Found candidates:", candidates.length);

    if (!election.blockchainElectionId) {
      return res.status(400).json({
        message: "Election has no blockchain ID",
        results: candidates.map(c => ({ ...c.toObject(), votes: 0 }))
      });
    }

    try {
      // 🔧 FIX: Use the specific election's blockchain ID
      console.log("🔗 Getting votes from blockchain for election ID:", election.blockchainElectionId);

      const blockchainData = await blockchain.getAllCandidatesWithVotes(election.blockchainElectionId);
      console.log("Raw blockchain data:", blockchainData);

      // 🔧 FIX: Handle different response formats
      let candidateAddresses, voteCounts;

      if (blockchainData && typeof blockchainData === 'object') {
        // Format 1: { candidates: [...], votes: [...] }
        if (blockchainData.candidates && blockchainData.votes) {
          candidateAddresses = blockchainData.candidates;
          voteCounts = blockchainData.votes;
        }
        // Format 2: [addresses[], counts[]]
        else if (Array.isArray(blockchainData) && blockchainData.length === 2) {
          candidateAddresses = blockchainData[0];
          voteCounts = blockchainData[1];
        }
        // Format 3: Direct arrays
        else if (blockchainData.length && Array.isArray(blockchainData[0])) {
          candidateAddresses = blockchainData[0];
          voteCounts = blockchainData[1];
        }
      }

      console.log("Processed - Addresses:", candidateAddresses);
      console.log("Processed - Vote counts:", voteCounts);

      // 🔧 FIX: Merge DB + blockchain data with correct property name
      const results = candidates.map(candidate => {
        let voteCount = 0;

        if (candidateAddresses && voteCounts) {
          const idx = candidateAddresses.findIndex(
            addr => addr.toLowerCase() === candidate.candidateWalletAddress.toLowerCase()
          );

          if (idx !== -1 && voteCounts[idx] !== undefined) {
            // 🔧 FIX: Safely convert BigNumber to regular number
            const rawVotes = voteCounts[idx];
            if (typeof rawVotes === 'object' && rawVotes.toString) {
              // BigNumber case
              voteCount = Number(rawVotes.toString());
            } else if (typeof rawVotes === 'string') {
              voteCount = Number(rawVotes);
            } else {
              voteCount = parseInt(rawVotes) || 0;
            }
          }
        }

        console.log(`Candidate ${candidate.name}: ${voteCount} votes`);

        return {
          ...candidate.toObject(),
          votes: voteCount  // 🔧 FIX: Use 'votes' property name (frontend expects this)
        };
      });

      // Sort by votes (highest first)
      results.sort((a, b) => b.votes - a.votes);

      console.log("Final results:", results);

      return res.status(200).json({
        message: "Election results fetched successfully",
        election: {
          title: election.title,
          phase: election.phase
        },
        results
      });

    } catch (blockchainError) {
      console.error("❌ Blockchain error:", blockchainError);

      // Return candidates with 0 votes if blockchain fails
      const fallbackResults = candidates.map(candidate => ({
        ...candidate.toObject(),
        votes: 0
      }));

      return res.status(200).json({
        message: "Results fetched with blockchain error (showing 0 votes)",
        error: blockchainError.message,
        results: fallbackResults
      });
    }

  } catch (error) {
    console.error("❌ getResults error:", error);
    res.status(500).json({
      message: "Failed to fetch results",
      error: error.message
    });
  }
};

// 🔧 FIX: Update listPastElectionsWithWinners to handle multiple elections
export const listPastElectionsWithWinners = async (req, res) => {
  try {
    // Find all completed elections (phase: result or ended), most recent first
    const elections = await Voting.find({
      phase: { $in: ["result", "ended"] }
    }).sort({ createdAt: -1 });

    const results = [];

    for (const election of elections) {
      // Get confirmed candidates for this election
      const candidates = await Candidate.find(
        { election: election._id, status: "confirmed" },
        "name party slogan logo candidateWalletAddress"
      );

      if (!election.blockchainElectionId) {
        // Skip elections without blockchain ID
        continue;
      }

      try {
        // Get blockchain votes for this specific election
        const { candidates: candidateAddresses, votes: voteCounts } = await blockchain.getAllCandidatesWithVotes(election.blockchainElectionId);

        // Merge and find winner
        const enriched = candidates.map((c) => {
          const idx = candidateAddresses.findIndex(
            (addr) => addr.toLowerCase() === c.candidateWalletAddress.toLowerCase()
          );
          return { ...c.toObject(), voteCount: idx !== -1 ? parseInt(voteCounts[idx]) : 0 };
        });

        const winner = enriched.reduce((max, cur) => (cur.voteCount > (max?.voteCount || 0) ? cur : max), null);

        results.push({
          election: {
            _id: election._id,
            title: election.title,
            description: election.description,
            startTime: election.startTime,
            createdAt: election.createdAt,
          },
          winner,
          candidates: enriched
        });
      } catch (error) {
        console.error(`Error fetching results for election ${election._id}:`, error);
        // Continue to next election if this one fails
      }
    }

    return res.json({ pastElections: results });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch past elections", error: error.message });
  }
};

// Check blockchain status
export const checkBlockchainStatus = async (req, res) => {
  try {
    console.log("🔍 Checking blockchain election status...");

    const currentElectionId = await blockchain.getCurrentElectionId();
    const isActive = await blockchain.isCurrentElectionActive();

    console.log(`Blockchain Election ID: ${currentElectionId}, Active: ${isActive}`);

    res.json({
      message: `Blockchain status - Election ID: ${currentElectionId}, Active: ${isActive}`,
      currentElectionId: currentElectionId,
      isActive: isActive
    });

  } catch (error) {
    console.error("❌ Failed to check blockchain status:", error);
    res.status(500).json({
      message: "Failed to check blockchain status",
      error: error.message
    });
  }
};

// End blockchain election
export const endBlockchainElection = async (req, res) => {
  try {
    console.log("🔚 Attempting to end blockchain election...");

    // Check if there's an active election first
    const isActive = await blockchain.isCurrentElectionActive();
    if (!isActive) {
      return res.status(400).json({
        message: "No active election found on blockchain"
      });
    }

    // End the election on blockchain
    const tx = await blockchain.endElection();
    console.log("⏳ Waiting for blockchain confirmation...");
    const receipt = await tx.wait();

    if (receipt.status !== 1) {
      throw new Error("Blockchain transaction failed");
    }

    console.log("✅ Blockchain election ended successfully");

    // Update database records to ended phase
    const updateResult = await Voting.updateMany(
      {
        blockchainElectionId: { $ne: null },
        phase: { $in: ["pending", "registration", "voting", "result"] }
      },
      { phase: "ended" }
    );

    console.log(`Updated ${updateResult.modifiedCount} database records to ended phase`);

    res.json({
      message: "Blockchain election ended successfully",
      transactionHash: receipt.hash,
      updatedRecords: updateResult.modifiedCount
    });

  } catch (error) {
    console.error("❌ Failed to end blockchain election:", error);
    res.status(500).json({
      message: "Failed to end blockchain election",
      error: error.message
    });
  }
};

// Debug user data
export const debugUser = async (req, res) => {
  try {
    console.log("🔍 Debug user data:");
    console.log("req.user:", req.user);
    console.log("req.cookies:", req.cookies);

    res.json({
      message: "Debug complete",
      user: req.user,
      cookies: req.cookies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this debug function to voting.controller.js
export const debugBlockchainVotes = async (req, res) => {
  try {
    console.log("🔍 Debug blockchain votes...");

    const election = await Voting.findOne().sort({ createdAt: -1 });
    console.log("Election:", election);

    if (election && election.blockchainElectionId) {
      console.log("Getting votes for election ID:", election.blockchainElectionId);

      const rawData = await blockchain.getAllCandidatesWithVotes(election.blockchainElectionId);
      console.log("Raw blockchain data:", rawData);
      console.log("Type:", typeof rawData);
      console.log("Is Array:", Array.isArray(rawData));

      if (rawData && typeof rawData === 'object') {
        console.log("Object keys:", Object.keys(rawData));
      }

      res.json({
        message: "Debug complete",
        electionId: election.blockchainElectionId,
        rawBlockchainData: rawData,
        dataType: typeof rawData,
        isArray: Array.isArray(rawData)
      });
    } else {
      res.json({
        message: "No election with blockchain ID found",
        election: election
      });
    }

  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
};
