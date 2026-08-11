import React from 'react';
import clsx from 'clsx';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { ACTIONS, EVENTS, EventData, Joyride, STATUS } from 'react-joyride';
import layoutStyles from './SolidityLabLayout.module.css';
import panelStyles from './SolidityLabPanels.module.css';
import {
  ARBITRUM_SEPOLIA,
  SOLC_VERSION,
  ActionIcon,
  SpotlightOnlyTooltip,
  TaskLessonContent,
  handleEditorKey,
  isLineActive,
  shortAddress,
} from './SolidityLabSupport';
import type { useSolidityLab } from './useSolidityLab';

const styles = { ...layoutStyles, ...panelStyles };

export function SolidityLabView(props: ReturnType<typeof useSolidityLab>) {
  const {
    source,
    fileName,
    contractName,
    height,
    tasks,
    sidebarIntro,
    useSpotlight,
    code,
    setCode,
    activeTaskIndex,
    issues,
    compiled,
    setCompiled,
    status,
    setManualRange,
    account,
    contractAddress,
    setContractAddress,
    lastTxHash,
    lastRead,
    mode,
    setMode,
    cursor,
    setCursor,
    spotlightMounted,
    spotlightRunning,
    setSpotlightRunning,
    processVisual,
    consoleEntries,
    explorerTransactions,
    setExplorerTransactions,
    setSelectedExplorerTxId,
    codeLayerRef,
    editorRef,
    prismTheme,
    highlightLanguage,
    activeTask,
    activeRange,
    errorCount,
    warningCount,
    totalLines,
    writeCallLabel,
    readCallLabel,
    selectedExplorerTransaction,
    isNetworkExplorerRelevant,
    isWalletExplorerRelevant,
    isTransactionsExplorerRelevant,
    isContractExplorerRelevant,
    joyrideSteps,
    moveToPreviousTask,
    clearActions,
    isActiveSpotlight,
    canRunAction,
    canAdvanceTask,
    connectWallet,
    writeCupcake,
    readBalance,
    advanceTask,
    handlePrimaryLessonAction,
    primaryLessonLabel,
    primaryLessonIcon,
    canUsePrimaryLessonAction,
    retreatTask,
  } = props;

  return (
    <section
      className={clsx(layoutStyles.solidityLab, panelStyles.solidityLab)}
      data-solidity-lab
      style={{ '--ide-editor-height': `${height}px` } as React.CSSProperties}
    >
      {useSpotlight && spotlightMounted && joyrideSteps.length > 0 && (
        <Joyride
          steps={joyrideSteps}
          stepIndex={activeTaskIndex}
          run={spotlightRunning}
          continuous
          scrollToFirstStep={false}
          tooltipComponent={SpotlightOnlyTooltip}
          floatingOptions={{ hideArrow: true }}
          onEvent={(data: EventData) => {
            if (
              data.type === EVENTS.STEP_AFTER &&
              (data.action === ACTIONS.NEXT || data.action === ACTIONS.CLOSE)
            ) {
              advanceTask();
            }
            if (data.type === EVENTS.STEP_AFTER && data.action === ACTIONS.PREV) {
              moveToPreviousTask();
            }
            if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
              setManualRange(undefined);
              setSpotlightRunning(false);
            }
          }}
          locale={{ next: 'Next', back: 'Back', close: 'Close', last: 'Done' }}
          options={{
            overlayColor: 'transparent',
            primaryColor: 'var(--ide-accent)',
            backgroundColor: 'var(--ide-side)',
            textColor: 'var(--ide-fg)',
            zIndex: 10000,
            hideOverlay: true,
            spotlightRadius: 5,
            scrollDuration: 0,
            scrollOffset: 0,
            showProgress: false,
            skipScroll: true,
            disableFocusTrap: true,
          }}
          styles={{
            arrow: {
              display: 'none',
            },
            overlay: {
              backgroundColor: 'transparent',
              mixBlendMode: 'normal',
            },
            tooltip: {
              border: '1px solid var(--ide-spotlight-border)',
              backgroundColor: 'var(--ide-side)',
              borderRadius: 6,
              boxShadow: '0 18px 44px rgb(0 0 0 / 36%)',
              fontFamily: 'var(--ifm-font-family-base)',
              maxWidth: 380,
              padding: 18,
            },
            tooltipContainer: {
              textAlign: 'left',
            },
            tooltipTitle: {
              color: 'var(--ide-fg)',
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.35,
            },
            tooltipContent: {
              color: 'var(--ide-chrome-fg)',
              fontSize: 13,
              lineHeight: 1.45,
              padding: '8px 0 0',
            },
            tooltipFooter: {
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
            },
            buttonBack: {
              border: '1px solid var(--ide-border)',
              borderRadius: 3,
              color: 'var(--ide-chrome-fg)',
              fontSize: 12,
              padding: '7px 10px',
            },
            buttonPrimary: {
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 800,
              padding: '8px 12px',
            },
            buttonClose: {
              color: 'var(--ide-muted)',
              height: 26,
              width: 26,
            },
          }}
        />
      )}
      <div className={styles.ideWorkbench} data-has-info={sidebarIntro ? 'true' : 'false'}>
        {sidebarIntro && (
          <aside className={styles.ideInfoPanel} aria-label="Lesson information">
            <div className={styles.ideLessonPanel} data-lab-spotlight="lesson">
              {sidebarIntro}
              {activeTask && (
                <div className={styles.ideLessonStepPanel} aria-live="polite">
                  <div className={styles.ideLessonStepContent}>
                    <div className={styles.ideLessonStepMeta}>
                      <span>
                        Step {activeTaskIndex + 1} / {tasks.length}
                      </span>
                      {activeTask.lines && (
                        <span>
                          L{activeTask.lines[0]}-{activeTask.lines[1]}
                        </span>
                      )}
                    </div>
                    <strong>{activeTask.label}</strong>
                    <TaskLessonContent task={activeTask} />
                  </div>
                  {tasks.length > 1 && (
                    <div className={styles.ideLessonNav}>
                      <button
                        type="button"
                        className={clsx(styles.ideLessonNavButton, styles.ideLessonNavPrimary)}
                        onClick={handlePrimaryLessonAction}
                        disabled={!canUsePrimaryLessonAction}
                        data-lab-spotlight="next"
                      >
                        {primaryLessonIcon && <ActionIcon name={primaryLessonIcon} />}
                        {primaryLessonLabel}
                      </button>
                      <button
                        type="button"
                        className={clsx(styles.ideLessonNavButton, styles.ideLessonNavGhost)}
                        onClick={retreatTask}
                        disabled={activeTaskIndex === 0}
                      >
                        Back
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
        <div className={styles.ideMainPane}>
          <div className={styles.ideTabBar}>
            <span className={styles.ideTabActive}>
              {fileName}
              {code !== source.trim() && (
                <span className={styles.ideModifiedDot} aria-label="Modified" title="Modified">
                  ●
                </span>
              )}
            </span>
          </div>
          <div
            className={styles.ideEditor}
            style={{ minHeight: height }}
            ref={editorRef}
            data-lab-spotlight="editor"
          >
            {activeTask && !useSpotlight && (
              <div className={styles.ideStepOverlay}>
                <div className={styles.ideStepOverlayMeta}>
                  <span>
                    {activeTaskIndex + 1} / {tasks.length}
                  </span>
                  {activeTask.lines && (
                    <span>
                      L{activeTask.lines[0]}-{activeTask.lines[1]}
                    </span>
                  )}
                </div>
                <strong>{activeTask.label}</strong>
                <TaskLessonContent task={activeTask} />
              </div>
            )}
            {tasks.length > 0 && !useSpotlight && (
              <button
                type="button"
                className={styles.ideStepNextButton}
                onClick={advanceTask}
                disabled={!canAdvanceTask}
                data-lab-spotlight="next"
              >
                Next
              </button>
            )}
            <Highlight
              Prism={defaultProps.Prism}
              theme={prismTheme}
              code={code}
              language={highlightLanguage}
            >
              {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  ref={codeLayerRef}
                  className={clsx(highlightClassName, styles.ideCodeLayer)}
                  style={style}
                  aria-hidden="true"
                >
                  <code>
                    {tokens.map((line, index) => {
                      const lineNumber = index + 1;
                      const issue = issues.find((item) => item.line === lineNumber);
                      const lineProps = getLineProps({ line });
                      const { key: lineKey, ...linePropsWithoutKey } = lineProps;
                      return (
                        <span
                          {...linePropsWithoutKey}
                          key={lineKey || lineNumber}
                          className={clsx(
                            lineProps.className,
                            styles.ideCodeLine,
                            isLineActive(lineNumber, activeRange) && styles.ideCodeLineActive,
                            issue?.severity === 'error' && styles.ideCodeLineError,
                            issue?.severity === 'warning' && styles.ideCodeLineWarning,
                          )}
                          data-active-line={
                            isLineActive(lineNumber, activeRange) ? 'true' : undefined
                          }
                          data-lab-active-line={
                            isLineActive(lineNumber, activeRange) ? 'true' : undefined
                          }
                        >
                          <span className={styles.ideLineNumber}>{lineNumber}</span>
                          <span className={styles.ideLineContent}>
                            {line.length === 0 ? (
                              <span> </span>
                            ) : (
                              line.map((token, key) => {
                                const tokenProps = getTokenProps({ token });
                                const { key: tokenKey, ...tokenPropsWithoutKey } = tokenProps;

                                return <span key={tokenKey || key} {...tokenPropsWithoutKey} />;
                              })
                            )}
                          </span>
                        </span>
                      );
                    })}
                  </code>
                </pre>
              )}
            </Highlight>
            <textarea
              value={code}
              wrap="off"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label={`${fileName} source editor`}
              className={styles.ideTextarea}
              onChange={(event) => {
                setCode(event.currentTarget.value);
                setCompiled(undefined);
                setContractAddress(undefined);
                setExplorerTransactions([]);
                setSelectedExplorerTxId(undefined);
                clearActions('compile', 'deploy', 'write', 'read');
              }}
              onKeyDown={(event) => handleEditorKey(event, setCode)}
              onSelect={(event) => {
                const target = event.currentTarget;
                const before = target.value.slice(0, target.selectionStart);
                const newlineIndex = before.lastIndexOf('\n');
                setCursor({
                  line: before.split('\n').length,
                  col: target.selectionStart - (newlineIndex === -1 ? -1 : newlineIndex),
                });
              }}
              onScroll={(event) => {
                if (!codeLayerRef.current) return;
                codeLayerRef.current.scrollTop = event.currentTarget.scrollTop;
                codeLayerRef.current.scrollLeft = event.currentTarget.scrollLeft;
              }}
            />
          </div>
          {issues.length > 0 && (
            <div className={styles.ideProblems} role="region" aria-label="Compiler problems">
              <div className={styles.ideProblemsHeader}>
                <strong>Problems</strong>
                <span>
                  {errorCount} errors · {warningCount} warnings
                </span>
              </div>
              <ul className={styles.ideProblemsList}>
                {issues.map((issue, index) => (
                  <li
                    key={`${issue.severity}-${issue.line}-${index}`}
                    className={clsx(
                      styles.ideProblemItem,
                      issue.severity === 'error' && styles.ideProblemItemError,
                      issue.severity === 'warning' && styles.ideProblemItemWarning,
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!issue.line) return;
                        setManualRange([issue.line, issue.line]);
                      }}
                    >
                      <span className={styles.ideProblemMeta}>
                        {issue.severity || 'info'}
                        {issue.line ? ` · L${issue.line}` : ''}
                      </span>
                      <span className={styles.ideProblemMessage}>{issue.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={styles.ideConsolePanel} aria-label="Technical console">
            <div className={styles.ideConsoleHeader}>
              <strong>Console</strong>
              <span>{consoleEntries.length} events</span>
            </div>
            <div className={styles.ideConsoleOutput} role="log" aria-live="polite">
              {consoleEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={clsx(
                    styles.ideConsoleLine,
                    entry.kind === 'success' && styles.ideConsoleLineSuccess,
                    entry.kind === 'error' && styles.ideConsoleLineError,
                  )}
                >
                  <span className={styles.ideConsolePrompt}>[{entry.source}]</span>
                  <span>{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
          {processVisual && (
            <div className={styles.ideProcessOverlay} aria-live="polite" aria-label={status}>
              <div className={styles.ideProcessStage} data-process={processVisual}>
                {processVisual === 'compile' ? (
                  <div className={styles.ideProcessDiagram}>
                    <div className={styles.ideProcessSource} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessFlow} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessArtifact} aria-hidden="true">
                      <span className={styles.ideBytecodeChunk} />
                      <span className={styles.ideBytecodeChunk} />
                      <span className={styles.ideBytecodeChunk} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.ideProcessDiagram} data-deploy="true">
                    <div className={styles.ideProcessArtifact} aria-hidden="true">
                      <span className={styles.ideDeployPayload} />
                    </div>
                    <div className={styles.ideProcessFlow} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessBlock} aria-hidden="true">
                      <span className={styles.ideDeployPayloadMini} />
                    </div>
                    <div className={styles.ideProcessFlow} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.ideProcessChain} aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                <strong>
                  {processVisual === 'compile' ? 'Compiling source' : 'Deploying contract'}
                </strong>
                <p>
                  {processVisual === 'compile'
                    ? 'Solidity source is being compressed into ABI and EVM bytecode.'
                    : 'Compiled bytecode is being placed into a new block on the selected network.'}
                </p>
              </div>
            </div>
          )}
        </div>
        <aside className={styles.ideActionPanel} aria-label="Block explorer">
          <div
            className={clsx(
              styles.ideExplorerNetworkPanel,
              !isNetworkExplorerRelevant && styles.ideExplorerItemDimmed,
            )}
          >
            <div className={styles.ideActionHeading}>Network</div>
            <div
              className={styles.ideModeSwitch}
              role="tablist"
              aria-label="Network"
              data-lab-spotlight="network"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'browser'}
                className={clsx(
                  styles.ideModeButton,
                  mode === 'browser' && styles.ideModeButtonActive,
                  isActiveSpotlight('network') && styles.ideModeButtonSpotlight,
                )}
                onClick={() => setMode('browser')}
              >
                Local Devnet
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'sepolia'}
                className={clsx(
                  styles.ideModeButton,
                  mode === 'sepolia' && styles.ideModeButtonActive,
                  isActiveSpotlight('network') && styles.ideModeButtonSpotlight,
                )}
                onClick={() => setMode('sepolia')}
              >
                Arbitrum Sepolia
              </button>
            </div>
            {mode === 'sepolia' && (
              <button
                type="button"
                className={clsx(
                  styles.ideExplorerCallButton,
                  isActiveSpotlight('connect') && styles.ideActionButtonSpotlight,
                )}
                onClick={connectWallet}
                data-lab-action="connect"
              >
                <ActionIcon name="connect" />
                Connect wallet
              </button>
            )}
          </div>
          <div
            className={clsx(
              styles.ideExplorerPanel,
              isActiveSpotlight('runtime') && styles.idePanelSpotlight,
            )}
            aria-label="Block explorer"
            data-lab-spotlight="runtime"
          >
            <div className={styles.ideExplorerHeader}>
              <div className={styles.ideActionHeading}>Block Explorer</div>
            </div>
            <div
              className={clsx(
                styles.ideExplorerSection,
                !isWalletExplorerRelevant && styles.ideExplorerItemDimmed,
              )}
            >
              <div className={styles.ideExplorerSectionTitle}>Connected Wallet</div>
              <dl className={styles.ideExplorerRows}>
                <div>
                  <dt>Wallet</dt>
                  <dd>{shortAddress(account)}</dd>
                </div>
                <div>
                  <dt>Contract</dt>
                  <dd>{shortAddress(contractAddress)}</dd>
                </div>
                <div>
                  <dt>Balance</dt>
                  <dd>{lastRead ? `${lastRead} cupcake${lastRead === '1' ? '' : 's'}` : '—'}</dd>
                </div>
              </dl>
            </div>
            <div
              className={clsx(
                styles.ideExplorerSection,
                !isTransactionsExplorerRelevant && styles.ideExplorerItemDimmed,
              )}
            >
              <div className={styles.ideExplorerSectionTitle}>Transactions</div>
              {explorerTransactions.length > 0 ? (
                <ul className={styles.ideExplorerTxList}>
                  {explorerTransactions.map((tx) => (
                    <li key={tx.id}>
                      <button
                        type="button"
                        className={clsx(
                          styles.ideExplorerTx,
                          selectedExplorerTransaction?.id === tx.id && styles.ideExplorerTxActive,
                        )}
                        onClick={() =>
                          setSelectedExplorerTxId((current) =>
                            current === tx.id ? undefined : tx.id,
                          )
                        }
                      >
                        <span className={styles.ideExplorerTxTop}>
                          <span className={styles.ideExplorerMethod}>{tx.method}</span>
                          <span
                            className={clsx(
                              styles.ideExplorerStatus,
                              tx.status === 'Success'
                                ? styles.ideExplorerStatusSuccess
                                : styles.ideExplorerStatusError,
                            )}
                          >
                            {tx.status}
                          </span>
                        </span>
                        <span className={styles.ideExplorerHash}>{shortAddress(tx.hash)}</span>
                        <span className={styles.ideExplorerTxMeta}>
                          From {shortAddress(tx.from)} To {shortAddress(tx.to)}
                        </span>
                        {selectedExplorerTransaction?.id === tx.id && (
                          <span className={styles.ideExplorerTxDetails}>
                            <span>
                              <strong>Hash</strong>
                              <span title={tx.hash}>{shortAddress(tx.hash)}</span>
                            </span>
                            <span>
                              <strong>Status</strong>
                              <span>{tx.status}</span>
                            </span>
                            <span>
                              <strong>Action</strong>
                              <span>{tx.method}</span>
                            </span>
                            <span>
                              <strong>From</strong>
                              <span title={tx.from}>{shortAddress(tx.from)}</span>
                            </span>
                            <span>
                              <strong>To</strong>
                              <span title={tx.to}>{shortAddress(tx.to)}</span>
                            </span>
                            {tx.link && (
                              <a
                                href={tx.link}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.ideExplorerExternalLink}
                              >
                                Open on Arbiscan
                              </a>
                            )}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.ideExplorerEmpty}>
                  Deploy to create the first transaction.
                </div>
              )}
            </div>
            <div
              className={clsx(
                styles.ideExplorerSection,
                !isContractExplorerRelevant && styles.ideExplorerItemDimmed,
              )}
            >
              <div className={styles.ideExplorerSectionTitle}>Contract</div>
              <dl className={styles.ideExplorerRows}>
                <div>
                  <dt>Name</dt>
                  <dd>{compiled?.contractName ?? contractName}</dd>
                </div>
                <div>
                  <dt>Call</dt>
                  <dd>{compiled ? writeCallLabel : '—'}</dd>
                </div>
                <div>
                  <dt>Call</dt>
                  <dd>{compiled ? readCallLabel : '—'}</dd>
                </div>
              </dl>
              <div className={styles.ideExplorerContractActions}>
                <button
                  type="button"
                  className={clsx(
                    styles.ideExplorerCallButton,
                    isActiveSpotlight('write') && styles.ideActionButtonSpotlight,
                  )}
                  onClick={writeCupcake}
                  disabled={!canRunAction('write')}
                  data-lab-action="write"
                >
                  <ActionIcon name="write" />
                  call {writeCallLabel}
                </button>
                <button
                  type="button"
                  className={clsx(
                    styles.ideExplorerCallButton,
                    isActiveSpotlight('read') && styles.ideActionButtonSpotlight,
                  )}
                  onClick={readBalance}
                  disabled={!canRunAction('read')}
                  data-lab-action="read"
                >
                  <ActionIcon name="read" />
                  call {readCallLabel}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div className={styles.ideStatusBar} role="status" data-lab-spotlight="status">
        <span className={styles.ideStatusSpacer} />
        <span className={styles.ideStatusItem}>
          Ln <strong>{cursor.line}</strong>, Col <strong>{cursor.col}</strong>
        </span>
        <span className={styles.ideStatusItem}>
          {totalLines} lines · Solidity · {SOLC_VERSION}
        </span>
        {lastTxHash && mode === 'sepolia' && (
          <a
            href={`${ARBITRUM_SEPOLIA.blockExplorerUrls[0]}tx/${lastTxHash}`}
            target="_blank"
            rel="noreferrer"
            className={styles.ideStatusLink}
          >
            View tx ↗
          </a>
        )}
      </div>
    </section>
  );
}
