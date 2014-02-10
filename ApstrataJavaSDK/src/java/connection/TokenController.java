package com.apstrata.client.java.connection;

import java.util.Date;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import org.apache.log4j.Logger;

/**
 * The TokenController is the orchestrator that handles refreshing and renewing of an Apstrata authentication token.
 * The main entry point to the orchestrator instance is the startTokenManagement() method,
 * which triggers the creation and scheduling of a new instance of {@link TokenRegenerateTask}, which
 * is ran immediately then ran again at the rate specified by TokenController.REGENERATE (seconds).
 * When ran, the {@link TokenRegenerateTask} instances asks the orchestrator instance to reset(), which
 * leads to:
 * <ul>
 * 	<li> 
 *  Resetting the timers (TokenController.startTime and TokenController.endTime). The timers are
 * 	respectively used to determine when to start counting for refreshing a token, and when to 
 * 	determine that a new token needs to be generated
 *  </li>
 *  <li>
 *	The invocation of startTokenRenewTask() that creates and schedule a new instance of TokenRenewTask
 *	</li>
 * </ul>
 */
public class TokenController {

	protected static Logger logger = Logger.getLogger("com.apstrata.client.java");
	
	private long renew;
	private long regenerate;
	private double renewalThreshold;
	private long startTime, endTime;
	
	private TokenConnection connection;
	
	private ScheduledExecutorService scheduledService = Executors.newScheduledThreadPool(1);
	private TokenRenewTask renewToken;
	private ScheduledFuture<?> renewTokenScheduler;
	private ScheduledFuture<?> regenerateTokenScheduler;
	private TokenRegenerateTask regenerateToken;
	
	public TokenController(TokenConnection connection, long renew, long regenerate, double renewalThreshold){
		
		this.connection = connection;
		this.renew = renew;
		this.regenerate = regenerate;
		this.renewalThreshold = renewalThreshold;
	}
	
	/**
	 * This method trigger the whole refresh/renew authentication token process.
	 */
	public void startTokenManagement() {
		
		this.startTokenRegenerateTask();
		this.startTokenRenewTask(true);
	}
	
	/**
	 * Invoke this method to stop renewing and regenerating authentication tokens
	 */
	public void stopTokenManagement() {
		
		if (this.renewTokenScheduler != null) {
			this.renewTokenScheduler.cancel(true);
		}
		
		if (this.regenerateTokenScheduler != null) {
			this.regenerateTokenScheduler.cancel(true);
		}
	}
	
	protected void setRenew(long connectionLifetime) {
		this.renew = connectionLifetime;	
	}

	protected void setRegenerate(long tokenExpiry) {
		this.regenerate = tokenExpiry;		
	}
	
	/**
	 * @return the instance of {@link TokenConnection} that is associated to this controller
	 */
	protected TokenConnection getConnection() {
		return this.connection;
	}
	
	/**
	 * Reset the startTime and endTime and cancel the currently scheduled {@link TokenRenewTask} instance that was in charge
	 * of refreshing the authentication token as it has expired and a new one was generated. Then start and schedule
	 * a new {@link TokenRenewTask} instance.
	 */
	protected void reset() {
		
		this.startTime = System.currentTimeMillis();
		this.endTime = this.startTime + this.getRegenerationRate() * 1000;
		logger.debug("Resetting times. Should expire at " + new Date(this.endTime)  + " first refresh at " + new Date(this.startTime + this.getRenewalRate() * 1000));
		if (this.renewTokenScheduler != null) {
			this.renewTokenScheduler.cancel(true);
		}
		
		this.startTokenRenewTask(false);		
	}
	
	private long getRenewalRate() {
		return Math.round(renew * renewalThreshold);
	}
	
	private long getRegenerationRate() {		
		return Math.round(regenerate * renewalThreshold);
	}
	
	/**
	 * Create a new instance of {@link TokenRegenerateTask} and schedule it for immediate execution, then
	 * execution every getRegenerationRate() seconds.
	 */
	private void startTokenRegenerateTask() {
		
		logger.debug("Starting token regenerate task");
		this.regenerateToken = new TokenRegenerateTask(this);
		this.regenerateTokenScheduler = scheduledService.scheduleAtFixedRate(regenerateToken, this.getRegenerationRate(), this.getRegenerationRate(), TimeUnit.SECONDS);
	}
	
	/**
	 * Create a new instance of {@link TokenRenewTask} and schedule it for periodic execution every 
	 * getRenewalRate() seconds
	 */
	private void startTokenRenewTask(boolean now) {	
		
		this.renewToken = new TokenRenewTask(this);
		long renewalRate = this.getRenewalRate();
		logger.debug("Starting token renewal task. Renewal rate " + renewalRate + " sec.");
		this.renewTokenScheduler = this.scheduledService.scheduleAtFixedRate(renewToken, now ? 0 : renewalRate, renewalRate, TimeUnit.SECONDS);
	}
}

/**
 * Instances of this class are responsible for renewing an Apstrata authentication token.
 */
class TokenRenewTask implements Runnable {

	private TokenController controller;
	
	/**
	 * Constructor of the TokenRewTask class
	 * @param controller: the instance of {@link TokenController} that is responsible for verifying that
	 * a token can be renewed and is not about to expire definitely.
	 */
	public TokenRenewTask(TokenController controller) {
		this.controller = controller;
	}
	
	@Override
	/**
	 * Contains the logic to renew an Apstrata token by invoking the VerifyCredentials Apstrata API.
	 */
	public void run() {		
		
		TokenController.logger.debug("Renewing token " + new Date());
		controller.getConnection().renewToken();
	}
}

/**
 * Instances of this classes are responsible for generating a new Apstrata authentication token.
 */
class TokenRegenerateTask implements Runnable {
	
	private TokenController controller;
	
	/**
	 * Constructor of the {@link TokenRegenerateTask} class.
	 * @param controller: instance of TokenController. It is notified by the current instance of TokenRegenerateTask
	 * when it starts running.
	 */
	public TokenRegenerateTask(TokenController controller) {
		this.controller = controller;
	}
	
	@Override
	/**
	 * Contains the logic to create a new an Apstrata token by invoking the VerifyCredentials Apstrata API.
	 * Once done, the instance invoke the reset() method of its controller in order to reset timers and therefore
	 * re-start the refresh/renew cycle.
	 */
	public void run() {
		
		TokenController.logger.debug("Regenerating token " + new Date());
		controller.getConnection().generateToken();
		controller.reset();
	}
}
